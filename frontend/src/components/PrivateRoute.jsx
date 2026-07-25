import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getCurrentRole, isAdmin } from '../config/permissions';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only routes: redirect non-admins to dashboard
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
