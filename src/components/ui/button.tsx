import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

/**
 * Site button. Styles live in globals.css (.btn + variant + size) so plain <button> and
 * <Link> elements can use the same classes. Legacy variant names map onto the system.
 */
type Variant = "primary" | "secondary" | "soft" | "ghost" | "dark" | "orange" | "outline" | "follow" | "white";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  soft: "btn-soft",
  ghost: "btn-ghost",
  dark: "btn-dark",
  // Legacy names
  orange: "btn-soft",
  outline: "btn-secondary",
  white: "btn-secondary",
  follow: "border border-white/80 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn("btn", `btn-${size}`, variants[variant], className)}
      {...props}
    />
  );
}
