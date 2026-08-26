"use client";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import { VariantSocialDiscovery } from "@/components/reels/variants/variant-social-discovery";
import { VariantFullbleedReel } from "@/components/reels/variants/variant-fullbleed-reel";
import { VariantB2bShowcase } from "@/components/reels/variants/variant-b2b-showcase";
import { VariantYoutubeCinematic } from "@/components/reels/variants/variant-youtube-cinematic";
import { VariantLiveCatalog } from "@/components/reels/variants/variant-live-catalog";
import { VariantCyberTech } from "@/components/reels/variants/variant-cyber-tech";

export type ReelCardProps = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  variantIndex?: number;
};

/**
 * ReelCard Router: Dispatches across 6 distinct state-of-the-art designs:
 * - Variant 0: Modern Social Discovery (Xiaohongshu / Twitter Feed style)
 * - Variant 1: Classic Full-Bleed Dark Reel (TikTok / Instagram Reels style)
 * - Variant 2: B2B Industrial Showcase (LinkedIn Spec-Sheet style)
 * - Variant 3: YouTube Studio / Cinematic Showcase
 * - Variant 4: Live Catalog & Interactive Shopping Reel
 * - Variant 5: Cyber-Machinery High-Tech Dark Glassmorphism
 */
export function ReelCard({ reel, manufacturer, productSlug, variantIndex = 0 }: ReelCardProps) {
  const variant = Math.abs(variantIndex) % 6;

  switch (variant) {
    case 0:
      return <VariantSocialDiscovery reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    case 1:
      return <VariantFullbleedReel reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    case 2:
      return <VariantB2bShowcase reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    case 3:
      return <VariantYoutubeCinematic reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    case 4:
      return <VariantLiveCatalog reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    case 5:
      return <VariantCyberTech reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
    default:
      return <VariantSocialDiscovery reel={reel} manufacturer={manufacturer} productSlug={productSlug} />;
  }
}
