import { BadgeCheck } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";

export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations();
  return (
    <BadgeCheck
      className={cn("h-4 w-4 fill-brand-blue text-white", className)}
      aria-label={t("ui.verifiedManufacturer")}
    />
  );
}
