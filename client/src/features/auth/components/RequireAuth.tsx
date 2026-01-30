/**
 * RequireAuth Component
 *
 * Route guard that redirects unauthenticated users to login.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '~stores/useAuthStore';
import { Spinner } from '~components/ui';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="text-sm font-medium text-text-secondary">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
