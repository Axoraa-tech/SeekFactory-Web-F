"use client";

import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { formatPriceRange } from "@/shared/lib/price-range";

/**
 * An INR amount in the visitor's chosen currency. Usable from server components, and safe from
 * hydration mismatches: it shows INR until the stored currency and rates are known.
 * With `maxInr` above `inr` it shows a range ("₹100 – ₹250").
 */
export function Price({ inr, maxInr }: { inr: number; maxInr?: number | null }) {
  const { formatPrice } = useRegionalSettings();
  return <>{formatPriceRange(inr, maxInr, formatPrice)}</>;
}
