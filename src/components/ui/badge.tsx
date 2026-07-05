import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "muted" | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  muted: "border-slate-800 bg-slate-900 text-slate-300",
  outline: "border-slate-700 bg-transparent text-slate-400",
};

export function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
