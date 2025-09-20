import React from 'react';
import { Navigate } from 'react-router-dom';
// Update the import path if AuthService is located elsewhere, for example:
import AuthService from '../../services/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = AuthService.getCurrentUser();
  
  if (!auth) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;