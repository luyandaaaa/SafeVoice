import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedReviewerRouteProps {
  children: React.ReactNode;
}

export const ProtectedReviewerRoute = ({ children }: ProtectedReviewerRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'reviewer') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};