import { useNavigate } from "react-router";
import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setActiveView } from "../../store/slices/uiSlice";
import { logoutThunk } from "../../store/slices/authSlice";
import { NAV_ITEMS, ADMIN_NAV_ITEM } from "../../constants";
import type { NavView } from "../../types";

const viewToPath: Record<NavView, string> = {
  "dashboard":  "/",
  "new-report": "/new-report",
  "patients":   "/patients",
  "reports":    "/reports",
  "exports":    "/exports",
  "users":      "/admin/users",
};

export const Sidebar: FC = () => {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const activeView  = useAppSelector((s) => s.ui.activeView);
  const user        = useAppSelector((s) => s.auth.user);
  const summary     = useAppSelector((s) => s.reports.summary);
  const isAdmin     = user?.role === "admin";

  const countMap: Partial<Record<NavView, number>> = {
    patients: summary?.patients,
    reports:  summary?.reports,
  };

  const handleNav = (view: NavView) => {
    dispatch(setActiveView(view));
    navigate(viewToPath[view]);
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  const NavButton = ({ view, label, icon, badge }: {
    view: NavView; label: string; icon: string; badge?: number;
  }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => handleNav(view)}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm
          transition-colors text-left
          ${isActive
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
      >
        <i className={`ti ${icon} text-base flex-shrink-0`} aria-hidden="true" />
        <span className="flex-1">{label}</span>
        {badge !== undefined && (
          <span className="ml-auto bg-brand-50 text-brand-600 text-[11px] font-medium px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[228px] bg-white border-r border-gray-100 flex flex-col
                      px-2.5 py-3 sticky top-0 h-screen overflow-y-auto scrollbar-thin flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 pb-3.5 mb-1.5 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <i className="ti ti-stethoscope text-white text-base" aria-hidden="true" />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-gray-900 leading-none">MedFit</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Security fitness certs</div>
        </div>
      </div>

      {/* Main nav */}
      <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
        <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          Workspace
        </p>
        {NAV_ITEMS.map(({ view, label, icon }) => (
          <NavButton
            key={view}
            view={view as NavView}
            label={label}
            icon={icon}
            badge={countMap[view as NavView]}
          />
        ))}
      </nav>

      {/* Admin-only section */}
      {isAdmin && (
        <>
          <hr className="my-3 border-gray-100" />
          <nav aria-label="Admin" className="flex flex-col gap-0.5">
            <p className="px-2.5 pb-1 text-[11px] font-medium text-amber-500 uppercase tracking-widest">
              Admin
            </p>
            <NavButton
              view={ADMIN_NAV_ITEM.view as NavView}
              label={ADMIN_NAV_ITEM.label}
              icon={ADMIN_NAV_ITEM.icon}
            />
          </nav>
        </>
      )}

      {/* Footer — user info + role badge + logout */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-1">
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0
              ${user.role === "admin" ? "bg-brand-100 text-brand-700" : "bg-green-100 text-green-700"}`}>
              {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-800 truncate">{user.name}</span>
                <span className={`text-[10px] px-1.5 py-px rounded-full font-medium flex-shrink-0
                  ${user.role === "admin" ? "bg-brand-50 text-brand-600" : "bg-green-50 text-green-700"}`}>
                  {user.role === "admin" ? "Admin" : "Doctor"}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 truncate">{user.clinicName}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm
                     text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <i className="ti ti-logout text-base" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
