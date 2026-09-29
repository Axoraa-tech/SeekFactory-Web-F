import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes } from "react";

/** Panel surface: large radius, faint edge and a soft shadow, as on the admin dashboard. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-line bg-surface shadow-card", className)}
      {...props}
    />
  );
}
