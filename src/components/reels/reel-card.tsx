"use client";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import { VariantB2bShowcase } from "@/components/reels/variants/variant-b2b-showcase";
import { VariantVerticalSplitStudio } from "@/components/reels/variants/variant-vertical-split-studio";
import { VariantVerticalCatalogSplit } from "@/components/reels/variants/variant-vertical-catalog-split";
import { VariantVerticalShopReel } from "@/components/reels/variants/variant-vertical-shop-reel";

export type ReelCardProps = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  variantIndex?: number;
  viewMode?: "landscape" | "vertical";
};

/**
 * ReelCard: Dispatches between:
 * - Landscape (16:9): Untouched, exclusively uses VariantB2bShowcase.
 * - Vertical (9:16): Diverse immersive portrait video layouts with side-by-side details, live comments & catalogs.
 */
export function ReelCard({
  reel,
  manufacturer,
  productSlug,
  variantIndex = 0,
  viewMode = "landscape",
}: ReelCardProps) {
  if (viewMode === "vertical") {
    const variant = variantIndex % 3;
    if (variant === 0) {
      return (
        <VariantVerticalSplitStudio
          reel={reel}
          manufacturer={manufacturer}
          productSlug={productSlug}
        />
      );
    }
    if (variant === 1) {
      return (
        <VariantVerticalCatalogSplit
          reel={reel}
          manufacturer={manufacturer}
          productSlug={productSlug}
        />
      );
    }
    return (
      <VariantVerticalShopReel
        reel={reel}
        manufacturer={manufacturer}
        productSlug={productSlug}
      />
    );
  }

  // Landscape remains completely untouched!
  return (
    <VariantB2bShowcase
      reel={reel}
      manufacturer={manufacturer}
      productSlug={productSlug}
    />
  );
}



