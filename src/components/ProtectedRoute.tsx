import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requireSuperAdmin?: boolean;
  children?: React.ReactNode;
}

export function ProtectedRoute({ requireSuperAdmin = false, children }: ProtectedRouteProps) {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/unidades" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
