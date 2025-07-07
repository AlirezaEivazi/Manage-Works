// src/routes/RoleBasedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
