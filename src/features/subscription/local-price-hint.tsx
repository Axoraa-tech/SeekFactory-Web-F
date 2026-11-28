"use client";

import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { cn } from "@/shared/lib/cn";

/**
 * "≈ £0.01 / month": a plan price (charged in rupees or yuan) in the viewer's own currency, at
 * today's market rate. Nothing when the viewer already uses the plan's currency or rates are loading.
 */
export function LocalPriceHint({ amount, currency, period, className }: {
  amount: number | null;
  currency: string;
  period?: string;
  className?: string;
}) {
  const { formatConverted, t } = useRegionalSettings();
  if (amount === null || amount <= 0) return null;
  const local = formatConverted(amount, currency);
  if (!local) return null;
  return (
    <p className={cn("text-[11px] font-semibold text-slate-500", className)} title={t("plans.marketRateHint", "At today's market rate")}>
      ≈ {local}{period ? ` ${period}` : ""}{" "}
      <RatesCredit />
    </p>
  );
}

/** Credit the free market-rates service asks for wherever its rates are shown. */
export function RatesCredit({ className }: { className?: string }) {
  return (
    <a
      href="https://www.exchangerate-api.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-[9.5px] font-normal text-slate-400 hover:underline", className)}
    >
      Rates by ExchangeRate-API
    </a>
  );
}
