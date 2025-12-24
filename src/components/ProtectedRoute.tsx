import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHost?: boolean;
}

/**
 * ProtectedRoute - Wrapper component for routes requiring authentication
 *
 * Features:
 * - Redirects unauthenticated users to /auth
 * - Preserves intended destination via location state
 * - Shows loading spinner during auth check
 * - Optional host role requirement
 */
const ProtectedRoute = ({ children, requireHost = false }: ProtectedRouteProps) => {
  const { user, isHost, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: location.pathname }} replace />;
  }

  // Check host requirement
  if (requireHost && !isHost) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
