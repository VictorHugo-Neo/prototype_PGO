import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('pgo_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
