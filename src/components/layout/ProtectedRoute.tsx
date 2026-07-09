import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "../../hooks/useRedux";

interface ProtectedRouteProps {
  requiredRole?: "doctor" | "admin";
}

/**
 * Wrap any route that requires authentication.
 * - Not initialized yet → show loading spinner (prevents flash of redirect)
 * - No user → redirect to /login, preserving the intended URL
 * - Wrong role → redirect to / (access denied)
 */
export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, initialized } = useAppSelector((s) => s.auth);
  const location = useLocation();

  // Still checking auth (app just loaded)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <i className="ti ti-loader-2 text-3xl text-brand-600 spin" aria-hidden="true" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Wrong role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
