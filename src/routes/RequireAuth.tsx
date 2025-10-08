// src/routes/RequireAuth.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth: React.FC = () => {
  const authToken = localStorage.getItem('authToken');

  return authToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RequireAuth;
