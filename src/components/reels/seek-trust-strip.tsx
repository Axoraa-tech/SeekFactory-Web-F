import { BadgeCheck } from "lucide-react";
import type { Manufacturer } from "@/entities/manufacturer";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";

/**
 * Small pill next to the factory name on a seek: "✓ Verified OEM · Since 2008".
 * Deliberately quiet (neutral surface, only the check in brand blue) so the video stays the focus.
 * It replaces the name's separate verified check, so "verified" is said once.
 * Unverified factories get the same pill without the check or the claim.
 */
export function SeekTrustBadge({
  manufacturer,
  className,
}: {
  manufacturer: Pick<Manufacturer, "verified" | "yearsEstablished">;
  className?: string;
}) {
  const t = useTranslations();
  const since = manufacturer.yearsEstablished > 0 ? manufacturer.yearsEstablished : null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-50 py-[2px] pl-1 pr-2 text-[10.5px] font-medium leading-4 text-slate-600 ring-1 ring-inset ring-slate-200/80",
        !manufacturer.verified && "pl-2",
        className,
      )}
    >
      {manufacturer.verified && <BadgeCheck className="h-3.5 w-3.5 fill-brand-blue text-white" aria-hidden="true" />}
      <span>{manufacturer.verified ? t("seek.trust.verifiedOem") : t("seek.trust.oem")}</span>
      {since && (
        <>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="tabular-nums text-slate-500">{t("seek.trust.since", { year: since })}</span>
        </>
      )}
    </span>
  );
}
