import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  badge?: number;
  children: ReactNode;
};

export function IconButton({ label, badge = 0, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-canvas hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
      <Badge count={badge} />
    </button>
  );
}
