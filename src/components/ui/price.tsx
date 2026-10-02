"use client";

import { useRegionalSettings } from "@/shared/i18n/regional-context";

/**
 * An INR amount in the visitor's chosen currency. Usable from server components, and safe from
 * hydration mismatches: it shows INR until the stored currency and rates are known.
 */
export function Price({ inr }: { inr: number }) {
  const { formatPrice } = useRegionalSettings();
  return <>{formatPrice(inr)}</>;
}
