import type { FC } from "react";

interface ToggleProps {
  label:       string;
  description?: string;
  checked:     boolean;
  onChange:    (val: boolean) => void;
  id:          string;
}

export const Toggle: FC<ToggleProps> = ({
  label, description, checked, onChange, id,
}) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="flex-1">
      <label htmlFor={id} className="text-sm text-gray-800 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 border-0
        ${checked ? "bg-brand-600" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
          transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  </div>
);
