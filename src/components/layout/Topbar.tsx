import type { FC, ReactNode } from "react";

interface TopbarProps {
  icon?:     string;
  title:     string;
  subtitle?: string;
  actions?:  ReactNode;
  onBack?:   () => void;   // shows back arrow on mobile
}

export const Topbar: FC<TopbarProps> = ({ icon, title, subtitle, actions, onBack }) => (
  <header className="
    bg-white border-b border-gray-100 flex-shrink-0
    px-4 lg:px-6
    h-14 lg:h-14
    flex items-center justify-between gap-3
    sticky top-0 z-30
  ">
    <div className="flex items-center gap-3 min-w-0">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <i className="ti ti-arrow-left text-lg" aria-hidden="true" />
        </button>
      )}
      {icon && !onBack && (
        <i className={`ti ${icon} text-lg text-gray-400 hidden lg:block flex-shrink-0`}
           aria-hidden="true" />
      )}
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-gray-900 leading-none truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
      </div>
    )}
  </header>
);
