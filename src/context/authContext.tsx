import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

// ---- Types ----
export interface User {
  username: string;
  role: string;        // always a role name like "ADMIN" | "LECTURER" | "STUDENT"
  id?: number;         // optional; not in your token
  email?: string;      // optional; not in your token
}

interface LoginResponseOK {
  message?: string;
  requiresOtp?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ requiresOtp: boolean }>;
  verifyOtp: (username: string, otp: string) => Promise<User>;
  logout: () => void;
}

// ---- Axios base ----
const rawBase = import.meta.env.VITE_API_URL as string | undefined;
if (!rawBase) throw new Error("VITE_API_URL is not set. Define it in your .env file.");
const API_BASE = rawBase.replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE, // e.g. http://localhost:8080/api
  // withCredentials: true, // uncomment if you use cookies
});

const setAuthHeader = (token?: string) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// ---- Helpers ----
function extractTokenFromResponse(data: any): string | undefined {
  // Your backend returns a token string; be tolerant of shapes:
  // "eyJhbGciOi..."  OR  { token: "..." }  OR  { data: "..." }  OR  { data:{token:"..."} }  OR  { access_token:"..." }
  if (!data) return undefined;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (typeof data.token === "string") return data.token;
    if (data.data) {
      if (typeof data.data === "string") return data.data;
      if (typeof data.data?.token === "string") return data.data.token;
    }
    if (typeof data.access_token === "string") return data.access_token;
  }
  return undefined;
}

function decodeJwtPayload<T = any>(jwt: string): T | undefined {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return undefined;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

function normalizeRoleFromClaims(claims: any): string {
  // Your AuthenticationService puts `roles` claim: List<String>
  const roles = claims?.roles;
  let role: string | undefined;

  if (Array.isArray(roles) && roles.length) role = roles[0];
  // fallbacks (in case of different naming)
  if (!role && typeof claims?.role === "string") role = claims.role;
  if (!role && Array.isArray(claims?.authorities)) role = claims.authorities[0];

  return (role ?? "STUDENT").toString().trim().toUpperCase();
}

// ---- Context ----
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ requiresOtp: true }),
  verifyOtp: async () => {
    throw new Error("verifyOtp not implemented");
  },
  logout: () => {},
});

type Props = { children: React.ReactNode };

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Safe boot from storage
  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || undefined;
      if (token) setAuthHeader(token);

      const raw = localStorage.getItem("user");
      if (raw && raw !== "undefined" && raw !== "null") {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.username === "string" && typeof parsed.role === "string") {
          setUser(parsed);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthHeader(undefined);
    }
  }, []);

  // Step 1: triggers OTP
  const login = async (username: string, password: string) => {
    try {
      await api.post<LoginResponseOK>("/auth/login", { username, password });
      sessionStorage.setItem("pending_username", username);
      return { requiresOtp: true };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed";
      throw new Error(msg);
    }
  };

  // Step 2: verify OTP -> token only; decode token to build user
  const verifyOtp = async (username: string, otp: string): Promise<User> => {
    try {
      const res = await api.post("/auth/verify-otp", { username, otp });
      const token = extractTokenFromResponse(res.data);
      if (!token) {
        throw new Error("Server did not return a token.");
      }

      // Save token & set auth header first
      localStorage.setItem("token", token);
      setAuthHeader(token);

      // Decode claims for username/roles
      const claims = decodeJwtPayload<any>(token) || {};
      const role = normalizeRoleFromClaims(claims);
      const uname = (claims?.sub || claims?.username || username).toString();

      const userData: User = {
        username: uname,
        role,
        // id/email might not be in the token; add if present:
        id: typeof claims?.id === "number" ? claims.id : undefined,
        email: typeof claims?.email === "string" ? claims.email : undefined,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      sessionStorage.removeItem("pending_username");
      return userData;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "OTP verification failed";
      console.error("verify-otp error:", err?.response?.status, err?.response?.data);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthHeader(undefined);
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem("pending_username");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
