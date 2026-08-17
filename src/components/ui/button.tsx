import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "orange" | "outline" | "ghost" | "follow" | "white";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-sm",
  orange: "bg-brand-orange text-white hover:brightness-95 shadow-sm",
  outline: "border border-line bg-white text-ink hover:bg-canvas",
  ghost: "text-ink-muted hover:bg-canvas hover:text-ink",
  follow:
    "border border-white/80 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
  white: "bg-white text-ink border border-white/40 hover:bg-white/90",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-3.5 text-sm",
        size === "lg" && "h-10 px-4 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
