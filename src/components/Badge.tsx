import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full border border-surface-border
        bg-surface px-2.5 py-0.5 text-xs font-medium text-neutral-300
        ${className}
      `}
    >
      {children}
    </span>
  );
}
