"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ImageIcon, Plus, Video } from "lucide-react";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { cn } from "@/shared/lib/cn";
import { OPEN_COMPOSER_EVENT, type ComposerMode } from "./events";

/**
 * Manufacturers' "Start a post" button with a two-item menu: post a video seek or a product.
 * On the feed the composer opens in place; anywhere else the items link to the Seller Hub forms.
 */
export function StartPostMenu({ inline = false }: {
  /** Sized to sit inside the search bar, where the Search button is for buyers. */
  inline?: boolean;
} = {}) {
  const { t } = useRegionalSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (mode: ComposerMode) => (e: React.MouseEvent) => {
    setOpen(false);
    if (!document.querySelector("[data-post-composer]")) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(OPEN_COMPOSER_EVENT, { detail: mode }));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("seller.composer.startAPost")}
        title={t("seller.composer.startAPost")}
        className={cn(
          "sf-btn-commit inline-flex items-center gap-1 whitespace-nowrap bg-brand-blue text-xs font-semibold text-white shadow-xs transition hover:bg-brand-blue-dark active:scale-95",
          inline ? "h-7 rounded-full px-3" : "h-8 rounded-lg px-2.5",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {/* Icon-only on small laptops so the search bar keeps its width */}
        <span className="hidden xl:inline">{t("seller.composer.startAPost")}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-card",
            // Inside the search bar it sits at the right end: open leftwards, under the button
            inline ? "right-0" : "left-1/2 -translate-x-1/2",
          )}
        >
          <Link
            href="/factory?tab=seeks&new=seek"
            role="menuitem"
            onClick={pick("seek")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50">
              <Video className="h-4 w-4 text-emerald-600" />
            </span>
            {t("seller.composer.postVideo")}
          </Link>
          <Link
            href="/factory?tab=products&new=product"
            role="menuitem"
            onClick={pick("product")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-blue-soft">
              <ImageIcon className="h-4 w-4 text-brand-blue" />
            </span>
            {t("seller.composer.postProduct")}
          </Link>
        </div>
      )}
    </div>
  );
}
