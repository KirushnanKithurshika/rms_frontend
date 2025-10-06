// src/routes/guards.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type Claims = { exp?: number; roles?: string[] };

function isAuthed() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { exp } = jwtDecode<Claims>(token);
    return !exp || Date.now() / 1000 < exp;
  } catch {
    return false;
  }
}

function hasRole(required: string[]) {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { roles = [] } = jwtDecode<Claims>(token);
    return required.some(r => roles.includes(r));
  } catch {
    return false;
  }
}

export function RequireAuth() {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireRole({ roles }: { roles: string[] }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return hasRole(roles) ? <Outlet /> : <Navigate to="/not-authorized" replace />;
}
