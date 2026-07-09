import type { FC } from "react";
import type { ReportStatus } from "../../types";

type BadgeVariant = ReportStatus | "new" | "existing" | "info";

const styles: Record<BadgeVariant, string> = {
  draft:     "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-800",
  certified: "bg-green-100 text-green-800",
  new:       "bg-blue-100 text-blue-700",
  existing:  "bg-violet-100 text-violet-700",
  info:      "bg-blue-100 text-blue-700",
};

const labels: Record<BadgeVariant, string> = {
  draft:     "Draft",
  submitted: "Submitted",
  certified: "Certified",
  new:       "New patient",
  existing:  "Existing patient",
  info:      "Info",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?:  string;
}

export const Badge: FC<BadgeProps> = ({ variant, label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${styles[variant]}`}>
    {label ?? labels[variant]}
  </span>
);
