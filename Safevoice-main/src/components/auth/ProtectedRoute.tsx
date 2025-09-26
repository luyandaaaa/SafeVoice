import React from 'react';
import { Navigate } from 'react-router-dom';
// Update the import path if AuthService is located elsewhere, for example:
import AuthService from '../../services/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = AuthService.getCurrentUser();
  const userRole = localStorage.getItem('safevoice_user_role');
  const pathname = window.location.pathname;
  
  if (!auth) {
    return <Navigate to="/auth" replace />;
  }

  // Check if reviewer tries to access user routes or vice versa
  if (userRole === 'reviewer' && !pathname.startsWith('/reviewer/')) {
    return <Navigate to="/reviewer/dashboard" replace />;
  } else if (userRole === 'primary' && pathname.startsWith('/reviewer/')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;