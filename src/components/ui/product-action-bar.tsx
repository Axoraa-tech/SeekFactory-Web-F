"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { minimumOrderQuantity } from "@/shared/lib/quantity";
import { OrderRequestModal } from "@/features/orders/order-request-modal";

type ProductActionBarProps = {
  /** Enables "Add to cart" in the order dialog. */
  productId?: string;
  priceInr?: number;
  unit?: string;
  moq?: string | number;
  productSlug?: string;
  productName?: string;
  manufacturerSlug?: string;
  /** Open the order dialog on mount (after signing in from it). */
  autoOpenOrder?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical" | "inline";
  showPrice?: boolean;
  className?: string;
};

export function ProductActionBar({
  productId,
  priceInr,
  unit = "",
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
  const router = useRouter();
  const [isOrderOpen, setIsOrderOpen] = useState(autoOpenOrder && Boolean(productSlug));

  const hasPrice = priceInr !== undefined && priceInr > 0;
  const minQty = minimumOrderQuantity(moq);

  // "Order" sends an order request to the factory (no payment); the price may be negotiated
  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOrderOpen(true);
  };

  // "Buy Now" goes to checkout with the delivery contact and bulk-tier pricing
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productSlug) return;
    router.push(`/checkout?product=${encodeURIComponent(productSlug)}&qty=${minQty}`);
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
            {hasPrice ? (
              <>
                <span
                  className={cn(
                    "font-extrabold tracking-tight text-slate-900",
                    isSmall ? "text-sm" : isLarge ? "text-2xl" : "text-lg"
                  )}
                >
                  {formatPrice(priceInr)}
                </span>
                {unit ? <span className="text-xs text-slate-500 font-medium">/{unit}</span> : null}
              </>
            ) : (
              <span className={cn("font-bold text-slate-700", isSmall ? "text-xs" : "text-sm")}>Price on request</span>
            )}
          </div>
          {moq !== undefined && moq !== "" && (
            <p className="text-[11px] text-slate-500 font-medium">
              Min. order: <span className="font-semibold text-slate-700">{typeof moq === "number" ? `${moq} ${unit}` : moq}</span>
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

        {productSlug && (
          /* 2. Order Request Button */
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
        )}

        {productSlug && hasPrice ? (
          /* 3. Buy Now Button */
          <button
            type="button"
            onClick={handleBuyNow}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap",
              "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-75",
              isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm flex-1 w-full" : "h-9 px-3.5 text-xs"
            )}
          >
            <Zap className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4", "fill-white/80")} />
            <span>{t("common.buyNow", "Buy Now")}</span>
          </button>
        ) : (
          /* No listed price (or no product): the factory quotes on request */
          <Link
            href={productSlug ? `/rfq/new?product=${productSlug}` : "/rfq/new"}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap bg-brand-blue hover:bg-brand-blue-dark",
              isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm flex-1 w-full" : "h-9 px-3.5 text-xs"
            )}
          >
            <FileText className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <span>Request Quote</span>
          </Link>
        )}
      </div>

      {isOrderOpen && productSlug && (
        <OrderRequestModal
          productSlug={productSlug}
          productId={productId}
          productName={productName}
          priceInr={hasPrice ? priceInr : undefined}
          unit={unit}
          moq={moq}
          onClose={() => setIsOrderOpen(false)}
        />
      )}
    </div>
  );
}
