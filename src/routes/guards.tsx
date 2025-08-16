import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

export const RequireAuth: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const loc = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} replace />;
};

export const RequireRole: React.FC<{ roles: string[] }> = ({ roles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
};

export const RequirePendingOtp: React.FC = () => {
  const hasPending = !!sessionStorage.getItem("pending_username");
  return hasPending ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicOnly: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Navigate to="/lecturerhome" replace /> : <Outlet />;
};
