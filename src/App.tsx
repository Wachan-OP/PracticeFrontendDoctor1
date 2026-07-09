import { useEffect } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./hooks/useRedux";
import { initAuth, forceLogout } from "./store/slices/authSlice";
import { fetchPatients } from "./store/slices/patientSlice";
import { fetchReports, fetchReportSummary }  from "./store/slices/reportSlice";

import { AppShell }       from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PublicRoute }    from "./components/layout/PublicRoute";

import { LoginPage }          from "./pages/auth/LoginPage";
import { RegisterPage }       from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";

import { DashboardPage }      from "./pages/DashboardPage";
import { NewReportPage }      from "./pages/NewReportPage";
import { PatientsPage }       from "./pages/PatientsPage";
import { ReportsPage }        from "./pages/ReportsPage";
import { ExportsPage }        from "./pages/ExportsPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";

import "./assets/global.css";

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login",           element: <LoginPage /> },
      { path: "/register",        element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,         element: <DashboardPage /> },
          { path: "/new-report", element: <NewReportPage /> },
          { path: "/patients",   element: <PatientsPage /> },
          { path: "/reports",    element: <ReportsPage /> },
          { path: "/exports",    element: <ExportsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/admin/users", element: <UserManagementPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <LoginPage /> },
]);

// Loads auth state, then fetches data once logged in
const AuthInit = () => {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);

  useEffect(() => {
    dispatch(initAuth());

    const handler = () => dispatch(forceLogout());
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [dispatch]);

  // Once authenticated, load the first page of patients & reports plus dashboard counts
  useEffect(() => {
    if (user && initialized) {
      dispatch(fetchPatients());
      dispatch(fetchReports());
      dispatch(fetchReportSummary());
    }
  }, [user, initialized, dispatch]);

  return null;
};

const App = () => (
  <Provider store={store}>
    <AuthInit />
    <RouterProvider router={router} />
  </Provider>
);

export default App;
