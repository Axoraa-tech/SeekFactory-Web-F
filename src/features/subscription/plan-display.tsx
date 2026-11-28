"use client";

import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { planPriceLabel, useBuyerPlan, type BuyerPlanTier } from "./use-buyer-plan";
import { RatesCredit } from "./local-price-hint";

export type PlanPriceDisplay = {
  /** The price in the currency chosen at the top of the page (e.g. "€0.01"). */
  main: string;
  /** What is actually charged ("₹1 (1 Rs)" / "10 Yuan (¥10)") when `main` is a conversion of it. */
  billed?: string;
};

/**
 * Buyer plan prices for display: shown in the viewer's selected currency (header "EN / EUR"), converted
 * at today's market rate from the plan's own price. The plan's own price (rupees, or yuan in China) is
 * what is charged, so it stays visible as "Billed as …" whenever the two differ.
 */
export function usePlanDisplay() {
  const { pricing, region, plans } = useBuyerPlan();
  const { formatConverted, selectedCurrency } = useRegionalSettings();
  const loaded = plans.length > 0;

  const show = (code: BuyerPlanTier, amount: number | null, sameCurrencyLabel: string): PlanPriceDisplay => {
    if (!loaded || amount === null) return { main: "—" };
    if (amount === 0) return { main: `${selectedCurrency.symbol.trim()}0` };
    const converted = formatConverted(amount, pricing.currencyCode);
    return converted ? { main: converted, billed: planPriceLabel(plans, code, region) } : { main: sameCurrencyLabel };
  };

  const pro = show("pro", pricing.proAmount, pricing.proPriceFormatted);
  return {
    free: show("free", 0, pricing.freePrice),
    pro,
    enterprise: show("enterprise", pricing.enterpriseAmount, pricing.enterprisePrice),
    /** Shown after the converted price only when no conversion happened ("(1 Rs)" / "(¥10)"). */
    proSub: pro.billed ? undefined : pricing.proPriceSub,
    /** For the upgrade buttons: the selected-currency price, or the plan's own label. */
    buttonLabel: (code: "pro" | "enterprise") => {
      const d = code === "pro" ? pro : show("enterprise", pricing.enterpriseAmount, pricing.enterprisePrice);
      return d.billed ? d.main : planPriceLabel(plans, code, region);
    },
    /** For the payment step: what to pay, with the selected-currency equivalent. */
    paymentLabel: (code: "pro" | "enterprise") => {
      const charged = planPriceLabel(plans, code, region);
      const d = code === "pro" ? pro : show("enterprise", pricing.enterpriseAmount, pricing.enterprisePrice);
      return d.billed ? `${charged} ≈ ${d.main}` : charged;
    },
  };
}

/** "Billed as ₹1 (1 Rs)" under a converted price, with the rates credit. */
export function BilledAs({ billed, className }: { billed?: string; className?: string }) {
  const { t } = useRegionalSettings();
  if (!billed) return null;
  return (
    <p className={className ?? "text-[11px] font-semibold text-slate-500"}>
      {t("plans.billedAs", { amount: billed })} <RatesCredit />
    </p>
  );
}
