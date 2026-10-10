"use client";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import type { Product } from "@/entities/product";
import { VariantB2bShowcase } from "@/components/reels/variants/variant-b2b-showcase";
import { useReelPopup } from "@/components/reels/use-reel-popup";

type ReelCardProps = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  products?: Product[];
  variantIndex?: number;
  viewMode?: "landscape" | "vertical";
  /** Feed-level index used to open the popup at the correct position */
  itemIndex?: number;
  /** Whether the viewer follows this factory; undefined for guests. */
  followingManufacturer?: boolean;
};

/**
 * ReelCard: Dispatches between reel card variants.
 * Wires itemIndex → popup context so the Maximize button opens the global ReelPopupModal.
 */
export function ReelCard({
  reel,
  manufacturer,
  productSlug,
  products = [],
  itemIndex = 0,
  followingManufacturer,
}: ReelCardProps) {
  const { openAt } = useReelPopup();

  return (
    <VariantB2bShowcase
      reel={reel}
      manufacturer={manufacturer}
      productSlug={productSlug}
      onExpand={() => openAt(itemIndex)}
      followingManufacturer={followingManufacturer}
      product={products[0]}
      // The first card of each column is above the fold
      eager={itemIndex < 2}
    />
  );
}
