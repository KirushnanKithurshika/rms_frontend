// src/routes/LandingRedirect.tsx
import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectPrivileges } from "../features/auth/selectors";
import { resolveLandingPath } from "./landing";

const LandingRedirect: React.FC = () => {
  const privs = useAppSelector(selectPrivileges);
  const location = useLocation();
  const path = useMemo(() => resolveLandingPath(privs), [privs]);

  // Avoid redirect loops if we're somehow already there
  if (location.pathname === path) return null;
  return <Navigate to={path} replace />;
};

export default LandingRedirect;
