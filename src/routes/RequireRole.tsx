import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function RequireRole({ allowed }: { allowed: string[] }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
