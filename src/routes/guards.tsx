// src/routes/guards.tsx
import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAppSelector } from "../app/hooks"; // <- typed hooks
import { selectToken } from "../features/auth/selectors"; // <- from auth slice

type Claims = {
  exp?: number;
  roles?: string[];
  sub?: string;
};

// ---- helpers ----
function parseClaims(token: string | null): Claims | null {
  if (!token) return null;
  try {
    return jwtDecode<Claims>(token);
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  const claims = parseClaims(token);
  if (!claims) return false;
  const { exp } = claims;
  // valid if no exp (rare) or current time < exp
  return !exp || Date.now() / 1000 < exp;
}

function hasAnyRole(token: string | null, required: string[]): boolean {
  const claims = parseClaims(token);
  if (!claims) return false;
  const roles = claims.roles || [];
  return required.some((r) => roles.includes(r));
}

// ---- Guards ----

// Blocks unauthenticated users.
export function RequireAuth() {
  const reduxToken = useAppSelector(selectToken);
  // fall back to localStorage so refreshes still work before slice hydrates
  const token = reduxToken ?? localStorage.getItem("token");
  const location = useLocation();

  const ok = useMemo(() => isTokenValid(token), [token]);
  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Blocks users who lack required roles.
export function RequireRole({ roles }: { roles: string[] }) {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const location = useLocation();

  const authed = useMemo(() => isTokenValid(token), [token]);
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  const allowed = useMemo(() => hasAnyRole(token, roles), [token, roles]);
  return allowed ? <Outlet /> : <Navigate to="/not-authorized" replace />;
}

// Keeps authenticated users away from pages like /login or /verification.
export function RequireAnonymous() {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const authed = useMemo(() => isTokenValid(token), [token]);
  return authed ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// Optional tiny helpers you may export/use elsewhere
export function getUserRoles(): string[] {
  const token = localStorage.getItem("token");
  const claims = parseClaims(token);
  return claims?.roles ?? [];
}
