import { BadgeCheck } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("h-4 w-4 fill-brand-blue text-white", className)}
      aria-label="Verified manufacturer"
    />
  );
}
