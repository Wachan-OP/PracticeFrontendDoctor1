import type { FC, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "primary" | "success" | "danger" | "ghost";
type Size    = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  icon?:      string;
  iconRight?: string;
  loading?:   boolean;
  children?:  ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-1.5 font-sans rounded-xl border " +
  "transition-all cursor-pointer select-none active:scale-[.97] " +
  "disabled:opacity-45 disabled:cursor-not-allowed touch-manipulation";

const variants: Record<Variant, string> = {
  default: "bg-white border-gray-200 text-gray-800 hover:bg-gray-50",
  primary: "bg-brand-600 border-brand-600 text-white hover:bg-brand-800 hover:border-brand-800",
  success: "bg-green-700 border-green-700 text-white hover:bg-green-800",
  danger:  "bg-red-700 border-red-700 text-white hover:bg-red-800",
  ghost:   "bg-transparent border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-800",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm min-h-[44px]",
  sm: "px-3 py-1.5 text-xs min-h-[36px]",
};

const iconSizes: Record<Size, string> = {
  md: "text-[15px]",
  sm: "text-[13px]",
};

export const Button: FC<ButtonProps> = ({
  variant  = "default",
  size     = "md",
  icon,
  iconRight,
  loading  = false,
  children,
  className = "",
  disabled,
  ...rest
}) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? (
      <i className={`ti ti-loader-2 spin ${iconSizes[size]}`} aria-hidden="true" />
    ) : icon ? (
      <i className={`ti ${icon} ${iconSizes[size]}`} aria-hidden="true" />
    ) : null}
    {children}
    {iconRight && !loading && (
      <i className={`ti ${iconRight} ${iconSizes[size]}`} aria-hidden="true" />
    )}
  </button>
);
