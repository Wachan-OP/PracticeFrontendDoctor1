import { useNavigate } from "react-router";
import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setActiveView } from "../../store/slices/uiSlice";
import type { NavView } from "../../types";

const viewToPath: Record<NavView, string> = {
  "dashboard":  "/",
  "new-report": "/new-report",
  "patients":   "/patients",
  "reports":    "/reports",
  "exports":    "/exports",
  "users":      "/admin/users",
};

const TABS: Array<{ view: NavView; label: string; icon: string }> = [
  { view: "dashboard",  label: "Home",     icon: "ti-layout-dashboard" },
  { view: "patients",   label: "Patients", icon: "ti-users" },
  { view: "new-report", label: "New",      icon: "ti-plus" },
  { view: "reports",    label: "Reports",  icon: "ti-files" },
  { view: "exports",    label: "Exports",  icon: "ti-download" },
];

export const BottomNav: FC = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const activeView = useAppSelector((s) => s.ui.activeView);

  const handleNav = (view: NavView) => {
    dispatch(setActiveView(view));
    navigate(viewToPath[view]);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40
                 bg-white border-t border-gray-100
                 pb-safe"
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ view, label, icon }, i) => {
          const isNew    = view === "new-report";
          const isActive = activeView === view && !isNew;

          return (
            <button
              key={i}
              onClick={() => handleNav(view)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5
                         relative transition-colors active:scale-95"
            >
              {/* FAB-style "New" button */}
              {isNew ? (
                <div className="w-12 h-12 rounded-2xl bg-brand-600
                                flex items-center justify-center
                                shadow-lg shadow-brand-600/30 -mt-6">
                  <i className="ti ti-plus text-white text-xl" aria-hidden="true" />
                </div>
              ) : (
                <>
                  <i className={`ti ${icon} text-xl
                    ${isActive ? "text-brand-600" : "text-gray-400"}`}
                    aria-hidden="true" />
                  <span className={`text-[10px] font-medium
                    ${isActive ? "text-brand-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute top-1 w-1 h-1 rounded-full bg-brand-600" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
