import type { FC, ReactNode } from "react";

interface SectionCardProps {
  title:     string;
  icon?:     string;
  children:  ReactNode;
  className?: string;
}

export const SectionCard: FC<SectionCardProps> = ({ title, icon, children, className = "" }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
      {icon && <i className={`ti ${icon} text-base text-gray-400`} aria-hidden="true" />}
      <span className="text-sm font-semibold text-gray-800">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
