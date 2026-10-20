"use client";

import { useTranslations } from "next-intl";
import { useBuyerPlan } from "@/features/subscription/use-buyer-plan";

/**
 * A supplier's name as the viewer may see it: the real name once supplier details are unlocked,
 * a generic "Verified supplier" while they are locked (free buyer). The real name is not put in
 * the page at all while locked, so it cannot be read from the DOM or by screen readers.
 *
 * This only covers what the UI renders. The API still returns supplier identity; hiding it from
 * the network needs backend redaction (see the supplier-unlock contract).
 */
export function useSupplierName() {
  const t = useTranslations();
  const { isSupplierLocked } = useBuyerPlan();
  return (name: string | null | undefined) => (isSupplierLocked ? t("supplier.lockedName") : name ?? "");
}

export function SupplierName({ name }: { name: string | null | undefined }) {
  const supplierName = useSupplierName();
  return <>{supplierName(name)}</>;
}
