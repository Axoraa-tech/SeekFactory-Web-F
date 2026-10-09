"use client";

import { useEffect } from "react";
import { useBuyerPlan } from "@/features/subscription";

/**
 * Pages that show the seller bar instead of the buyer TopNav still have to tell the plan provider
 * this is a manufacturer; otherwise their own public profile renders behind the buyer upgrade lock.
 */
export function SupplierPlanSync() {
  const { syncPlan } = useBuyerPlan();
  useEffect(() => {
    syncPlan("free", true);
  }, [syncPlan]);
  return null;
}
