import { Award, Factory, ShieldCheck } from "lucide-react";
import type { Manufacturer } from "@/entities/manufacturer";
import { useTranslations } from "next-intl";

/**
 * The line above a seek that says who is selling: a vermilion seal for verified OEMs, the
 * founding year, and a quiet "Verified factory" chip. Unverified factories get a neutral
 * label and no claims.
 */
export function SeekTrustStrip({ manufacturer }: { manufacturer: Pick<Manufacturer, "verified" | "yearsEstablished"> }) {
  const t = useTranslations();
  const since = manufacturer.yearsEstablished > 0 ? manufacturer.yearsEstablished : null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[rgba(28,22,22,0.06)] bg-[linear-gradient(90deg,rgba(202,65,54,0.09)_0%,rgba(202,65,54,0.025)_48%,transparent_100%)] px-3.5 py-2 text-[11px] sm:px-4 sm:text-xs">
      <div className="flex min-w-0 items-center gap-2">
        {manufacturer.verified ? (
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-red text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_3px_8px_-3px_rgba(202,65,54,0.7)]">
            <Award className="h-3 w-3" strokeWidth={2.25} />
          </span>
        ) : (
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-ink-muted ring-1 ring-[rgba(28,22,22,0.08)]">
            <Factory className="h-3 w-3" />
          </span>
        )}
        <span className="truncate font-semibold tracking-[-0.005em] text-ink">
          {manufacturer.verified ? t("seek.trust.verifiedOemManufacturer") : t("seek.trust.oemManufacturer")}
        </span>
        {since && (
          <>
            <span className="h-3 w-px shrink-0 bg-[rgba(28,22,22,0.14)]" aria-hidden="true" />
            <span className="shrink-0 text-ink-muted">{t("seek.trust.since", { year: since })}</span>
          </>
        )}
      </div>

      {manufacturer.verified && (
        <span className="hidden shrink-0 items-center gap-1 rounded-full sm:inline-flex bg-white/85 px-2 py-0.5 font-semibold text-ink ring-1 ring-[rgba(28,22,22,0.07)] shadow-[0_1px_2px_rgba(28,22,22,0.05)]">
          <ShieldCheck className="h-3 w-3 text-brand-red" strokeWidth={2.25} />
          {t("seek.trust.verifiedFactory")}
        </span>
      )}
    </div>
  );
}
