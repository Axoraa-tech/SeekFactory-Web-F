"use client";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import type { Product } from "@/entities/product";
import { VariantB2bShowcase } from "@/components/reels/variants/variant-b2b-showcase";
import { VariantVerticalSplitStudio } from "@/components/reels/variants/variant-vertical-split-studio";
import { VariantVerticalCatalogSplit } from "@/components/reels/variants/variant-vertical-catalog-split";
import { VariantVerticalShopReel } from "@/components/reels/variants/variant-vertical-shop-reel";
import { VariantInstagramProductReel } from "@/components/reels/variants/variant-instagram-product-reel";

export type ReelCardProps = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  products?: Product[];
  variantIndex?: number;
  viewMode?: "landscape" | "vertical";
};

/**
 * ReelCard: Dispatches between:
 * - Instagram Product Reel: When 3 or more tagged products are featured (both landscape & vertical).
 * - Vertical (9:16): Diverse immersive portrait video layouts with side-by-side details, live comments & catalogs.
 * - Landscape (16:9): Classic B2B showcase view.
 */
export function ReelCard({
  reel,
  manufacturer,
  productSlug,
  products = [],
  variantIndex = 0,
  viewMode = "landscape",
}: ReelCardProps) {
  // If the reel has 3 or more products, render the Instagram-style products showcase
  if (products.length >= 3 || reel.productIds.length >= 3) {
    return (
      <VariantInstagramProductReel
        reel={reel}
        manufacturer={manufacturer}
        productSlug={productSlug}
        products={products}
        viewMode={viewMode}
      />
    );
  }

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

  // Landscape remains B2b showcase
  return (
    <VariantB2bShowcase
      reel={reel}
      manufacturer={manufacturer}
      productSlug={productSlug}
    />
  );
}



