// src/services/api.ts
import axios, { AxiosHeaders } from "axios";

/**
 * Base URL setup
 * Priority: .env → fallback localhost:8087/api
 */
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    ""
  ) ?? "http://13.60.171.88:8080/api"; // 👈 match your Spring Boot backend port

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

/**
 * REQUEST INTERCEPTOR
 * Adds Authorization header for non-/auth routes.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "";
  const url = String(config.url ?? "");
  const isAuthEndpoint = /\/auth(\/|$)/.test(url);

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (token && !isAuthEndpoint) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;
  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * Optional: auto-logout when JWT expires or 401/403 occurs.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && [401, 403].includes(err.response.status)) {
      // clear local storage + reload login
      localStorage.removeItem("token");
      localStorage.removeItem("pendingUsername");
      sessionStorage.clear();

      // redirect to login (safe in browser context)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
