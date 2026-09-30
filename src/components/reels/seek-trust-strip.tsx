import { BadgeCheck, Factory, ShieldCheck } from "lucide-react";
import type { Manufacturer } from "@/entities/manufacturer";
import { useTranslations } from "next-intl";

/**
 * The band above a seek that says who is selling. Verified OEMs get a solid brand-blue band
 * (white seal, white text, a faint sheen every 5 s); the founding year and a "Verified factory" chip sit
 * in it. Unverified factories get a neutral grey line and no claims.
 * Styles: .trust-bar / .trust-seal in globals.css.
 */
export function SeekTrustStrip({ manufacturer }: { manufacturer: Pick<Manufacturer, "verified" | "yearsEstablished"> }) {
  const t = useTranslations();
  const since = manufacturer.yearsEstablished > 0 ? manufacturer.yearsEstablished : null;

  if (!manufacturer.verified) {
    return (
      <div className="flex items-center gap-2 border-b border-slate-100 px-3.5 py-2 text-[11px] text-ink-muted sm:px-4 sm:text-xs">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Factory className="h-3 w-3" />
        </span>
        <span className="truncate font-medium">{t("seek.trust.oemManufacturer")}</span>
        {since && <span className="shrink-0 text-ink-faint">· {t("seek.trust.since", { year: since })}</span>}
      </div>
    );
  }

  return (
    <div className="trust-bar flex items-center justify-between gap-3 px-3.5 py-1.5 text-[11px] text-white sm:px-4 sm:text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <span className="trust-seal h-[18px] w-[18px] shrink-0">
          <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
        </span>
        <span className="truncate font-semibold tracking-[-0.005em]">{t("seek.trust.verifiedOemManufacturer")}</span>
        {since && (
          <>
            <span className="h-3 w-px shrink-0 bg-white/30" aria-hidden="true" />
            <span className="shrink-0 font-medium tabular-nums text-white/75">{t("seek.trust.since", { year: since })}</span>
          </>
        )}
      </div>

      <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/90 ring-1 ring-inset ring-white/20 sm:inline-flex">
        <ShieldCheck className="h-3 w-3" strokeWidth={2.25} />
        {t("seek.trust.verifiedFactory")}
      </span>
    </div>
  );
}
