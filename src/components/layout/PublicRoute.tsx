import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../hooks/useRedux";

/**
 * Wrap public auth pages (/login, /register, /forgot-password).
 * If the user is already logged in, send them to the dashboard.
 */
export const PublicRoute = () => {
  const { user, initialized } = useAppSelector((s) => s.auth);

  if (!initialized) return null;   // wait silently

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};
