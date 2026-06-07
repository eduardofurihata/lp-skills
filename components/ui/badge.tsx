import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "outline" | "none";

const variantClasses: Record<Variant, string> = {
  default:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
  accent:
    "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
  outline:
    "border border-[color:var(--color-border-strong)] text-[color:var(--color-text-muted)]",
  none: "",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
