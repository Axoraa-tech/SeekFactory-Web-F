"use client";

import { useEffect } from "react";
import { getApi } from "@/shared/api";
import { getViewerId } from "@/shared/lib/viewer-id";

/** Products already reported during this page visit (also absorbs React StrictMode double effects). */
const reported = new Set<string>();

/**
 * Records one product view when a buyer actually opens the product page in a browser.
 * Done client-side (not during server render) so link prefetches and crawlers don't count.
 * The backend dedupes repeat views and ignores the owning factory.
 */
export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    if (!productId || reported.has(productId)) return;
    reported.add(productId);
    void getApi().products.recordView(productId, getViewerId());
  }, [productId]);

  return null;
}
