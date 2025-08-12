import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function RequireAuth() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return 
    <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
