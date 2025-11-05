// src/routes/guards.tsx
import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAppSelector } from "../app/hooks";
import {
  selectToken,
  selectUserRoles,
  selectUsername,
} from "../features/auth/selectors";

type Claims = {
  exp?: number;
  roles?: string[];
  authorities?: string[];
  sub?: string;
  userId?: number;
};

// ---------- helpers ----------
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
  return !exp || Date.now() / 1000 < exp;
}

function rolesFromToken(token: string | null): string[] {
  const c = parseClaims(token);
  if (!c) return [];
  // prefer 'roles', fallback to 'authorities'
  return (c.roles && c.roles.length ? c.roles : c.authorities) ?? [];
}

function hasAny(required: string[], mine: string[]): boolean {
  if (!required?.length) return true; // no requirement
  if (!mine?.length) return false;
  const set = new Set(mine);
  return required.some((r) => set.has(r));
}

function hasAll(required: string[], mine: string[]): boolean {
  if (!required?.length) return true; // no requirement
  if (!mine?.length) return false;
  const set = new Set(mine);
  return required.every((r) => set.has(r));
}

// ---------- Guards ----------

// Blocks unauthenticated users.
export function RequireAuth() {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const location = useLocation();

  const ok = useMemo(() => isTokenValid(token), [token]);
  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Blocks users who lack ANY of the required roles (logical OR).
export function RequireRole({ roles }: { roles: string[] }) {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const location = useLocation();

  const authed = useMemo(() => isTokenValid(token), [token]);
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Prefer roles already stored in Redux (from /auth/me), fallback to JWT
  const reduxRoles = useAppSelector(selectUserRoles);
  const effectiveRoles = reduxRoles?.length
    ? reduxRoles
    : rolesFromToken(token);

  const allowed = useMemo(
    () => hasAny(roles, effectiveRoles),
    [roles, effectiveRoles]
  );

  return allowed ? <Outlet /> : <Navigate to="/not-authorized" replace />;
}

// Same as RequireRole, but requires ALL roles (logical AND).
export function RequireAllRoles({ roles }: { roles: string[] }) {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const location = useLocation();

  const authed = useMemo(() => isTokenValid(token), [token]);
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const reduxRoles = useAppSelector(selectUserRoles);
  const effectiveRoles = reduxRoles?.length
    ? reduxRoles
    : rolesFromToken(token);

  const allowed = useMemo(
    () => hasAll(roles, effectiveRoles),
    [roles, effectiveRoles]
  );

  return allowed ? <Outlet /> : <Navigate to="/not-authorized" replace />;
}

// Keeps authenticated users away from /login or /verification.
export function RequireAnonymous() {
  const reduxToken = useAppSelector(selectToken);
  const token = reduxToken ?? localStorage.getItem("token");
  const authed = useMemo(() => isTokenValid(token), [token]);
  return authed ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// ---------- optional tiny helpers ----------
export function getUserRoles(): string[] {
  // Prefer Redux first
  try {
    const stateRoles = useAppSelector(selectUserRoles); // only valid inside a component
    if (stateRoles?.length) return stateRoles;
  } catch {
    // ignore: useAppSelector cannot be called outside React render
  }
  // Fallback to token decode
  const token = localStorage.getItem("token");
  return rolesFromToken(token);
}

export function getUsernameFromToken(): string | undefined {
  const token = localStorage.getItem("token");
  return parseClaims(token)?.sub;
}

export function getUserIdFromToken(): number | undefined {
  const token = localStorage.getItem("token");
  return parseClaims(token)?.userId;
}
