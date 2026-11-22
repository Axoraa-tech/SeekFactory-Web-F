"use client";

import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProductShare } from "@/features/engagement/use-product-share";

/**
 * Manufacturer Hub: shares the product's public buyer page (/products/<slug>), never the private
 * hub preview, so whoever opens the link sees what buyers see. Phones open the share sheet;
 * desktops copy the link.
 */
export function ShareProductButton({ slug, name, disabled }: { slug: string; name: string; disabled?: boolean }) {
  const t = useTranslations();
  const sharing = useProductShare(slug, name);
  const done = sharing.status === "shared";
  return (
    <button
      type="button"
      onClick={() => void sharing.share()}
      disabled={disabled || sharing.pending || !slug}
      title={disabled ? t("seller.products.shareWhenLive") : done ? t("seller.top.linkCopied") : t("seller.products.shareBuyerLink")}
      aria-label={t("seller.products.shareBuyerLink")}
      className="sf-btn-nav flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas hover:bg-white hover:border-brand-blue hover:text-brand-blue px-3 py-1.5 text-xs font-bold text-neutral-700 transition shadow-2xs disabled:opacity-50 disabled:hover:border-line disabled:hover:text-neutral-700"
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
      <span>{done ? t("seller.top.linkCopied") : t("common.share")}</span>
    </button>
  );
}
