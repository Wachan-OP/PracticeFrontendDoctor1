import type { FC } from "react";
import { initials } from "../../utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-11 h-11 text-[15px]",
};

export const Avatar: FC<AvatarProps> = ({ name, size = "md" }) => (
  <div
    className={`${sizes[size]} rounded-full bg-blue-100 text-blue-700 
      flex items-center justify-center font-medium flex-shrink-0`}
    aria-hidden="true"
  >
    {initials(name)}
  </div>
);
