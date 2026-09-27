"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Zap, MessageSquare } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { OrderRequestModal } from "@/features/orders/order-request-modal";

type ProductActionBarProps = {
  priceInr?: number;
  unit?: string;
  moq?: string | number;
  productSlug?: string;
  /** Shown in the order request form. */
  productName?: string;
  manufacturerSlug?: string;
  /** Open the order request form on mount (e.g. ?order=1 after signing in). */
  autoOpenOrder?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical" | "inline";
  showPrice?: boolean;
  className?: string;
};

export function ProductActionBar({
  priceInr,
  unit = "Unit",
  moq,
  productSlug,
  productName,
  manufacturerSlug,
  autoOpenOrder = false,
  size = "md",
  layout = "horizontal",
  showPrice = true,
  className,
}: ProductActionBarProps) {
  const { t, formatPrice } = useRegionalSettings();
  const [isBuying, setIsBuying] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(autoOpenOrder && Boolean(productSlug));

  // "Order" sends an order request to the factory (no payment). Without a product slug
  // (e.g. demo reels) there is nothing to order, so fall back to a custom RFQ.
  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (productSlug) {
      setIsOrderOpen(true);
    } else {
      window.location.href = "/rfq/new";
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBuying(true);
    
    setTimeout(() => {
      setIsBuying(false);
      if (manufacturerSlug && productSlug) {
        window.location.href = `/messages?with=${manufacturerSlug}&action=buy&product=${productSlug}`;
      } else {
        window.location.href = productSlug ? `/products/${productSlug}?action=checkout` : "/rfq/new";
      }
    }, 400);
  };

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <div
      className={cn(
        "flex",
        layout === "vertical" ? "flex-col gap-3" : "items-center justify-between gap-2.5",
        className
      )}
    >
      {/* Price & MOQ Section */}
      {showPrice && priceInr !== undefined && (
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-extrabold tracking-tight text-slate-900",
                isSmall ? "text-sm" : isLarge ? "text-2xl" : "text-lg"
              )}
            >
              {formatPrice(priceInr)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/{unit}</span>
          </div>
          {moq !== undefined && (
            <p className="text-[11px] text-slate-500 font-medium">
              Min. order: <span className="font-semibold text-slate-700">{typeof moq === "number" ? `${moq} ${unit}s` : moq}</span>
            </p>
          )}
        </div>
      )}

      {/* Interactive Action Buttons */}
      <div
        className={cn(
          "flex items-center gap-2.5",
          layout === "vertical" ? "w-full flex-col sm:flex-row" : "shrink-0"
        )}
      >
        {/* 1. Chat with Manufacturer Button */}
        <Link
          href={manufacturerSlug ? `/messages?with=${manufacturerSlug}` : "/messages"}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:border-brand-blue/40 hover:bg-blue-50/60 hover:text-brand-blue transition-all active:scale-95 shadow-2xs whitespace-nowrap",
            isSmall ? "h-8 px-2.5 text-xs" : isLarge ? "h-12 px-5 text-sm w-full sm:w-auto" : "h-9 px-3 text-xs"
          )}
          title="Chat with factory"
        >
          <MessageSquare className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4", "text-brand-blue")} />
          <span>{t("common.chat", "Chat")}</span>
        </Link>

        {/* 2. Order Request Button */}
        <button
          type="button"
          onClick={handleOrder}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap",
            "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
            isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm flex-1 w-full" : "h-9 px-3.5 text-xs"
          )}
          title="Send an order request to the factory"
        >
          <ShoppingCart className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <span>{t("common.order", "Order")}</span>
        </button>

        {/* 3. Buy Now Button */}
        <button
          type="button"
          disabled={isBuying}
          onClick={handleBuyNow}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap",
            "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-75",
            isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm flex-1 w-full" : "h-9 px-3.5 text-xs"
          )}
        >
          <Zap className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4", "fill-white/80")} />
          <span>{isBuying ? "Processing..." : t("common.buyNow", "Buy Now")}</span>
        </button>
      </div>

      {isOrderOpen && productSlug && (
        <OrderRequestModal
          productSlug={productSlug}
          productName={productName}
          priceInr={priceInr}
          unit={unit}
          moq={moq}
          onClose={() => setIsOrderOpen(false)}
        />
      )}
    </div>
  );
}
