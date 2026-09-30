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
  const { t, formatPrice, translateUnit } = useRegionalSettings();
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
        layout === "vertical" ? "flex-col gap-3" : "flex-wrap items-center justify-between gap-x-2.5 gap-y-2",
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
                    "font-extrabold tracking-tight text-brand-red-dark",
                    isSmall ? "text-sm" : isLarge ? "text-2xl" : "text-lg"
                  )}
                >
                  {formatPrice(priceInr)}
                </span>
                {unit ? <span className="text-xs text-ink-muted font-medium">/{translateUnit(unit)}</span> : null}
              </>
            ) : (
              <span className={cn("font-bold text-slate-700", isSmall ? "text-xs" : "text-sm")}>{t("product.actions.priceOnRequest")}</span>
            )}
          </div>
          {moq !== undefined && moq !== "" && (
            <p className="whitespace-nowrap text-[11px] text-slate-500 font-medium">
              {t("product.actions.minOrder")} <span className="font-semibold text-slate-700">{typeof moq === "number" ? `${moq} ${unit}` : moq}</span>
            </p>
          )}
        </div>
      )}

      {/* Interactive Action Buttons */}
      <div
        className={cn(
          "flex items-center gap-2.5",
          layout === "vertical" ? "w-full flex-col sm:flex-row" : "ml-auto shrink-0"
        )}
      >
        {/* 1. Chat with Manufacturer Button */}
        <Link
          href={manufacturerSlug ? `/messages?with=${manufacturerSlug}` : "/messages"}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "btn btn-secondary",
            isSmall ? "h-8 px-2.5 text-xs" : isLarge ? "h-12 px-5 text-sm w-full sm:w-auto" : "h-9 px-3 text-xs"
          )}
          title={t("product.actions.chatWithFactory")}
        >
          <MessageSquare className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <span>{t("common.chat", "Chat")}</span>
        </Link>

        {productSlug && (
          /* 2. Order Request Button */
          <button
            type="button"
            onClick={handleOrder}
            className={cn(
              "btn btn-soft",
              isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm w-full sm:flex-1" : "h-9 px-3.5 text-xs"
            )}
            title={t("product.actions.sendAnOrderRequestTo")}
          >
            <ShoppingCart className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4", "text-brand-red")} />
            <span>{t("common.order", "Order")}</span>
          </button>
        )}

        {productSlug && hasPrice ? (
          /* 3. Buy Now Button */
          <button
            type="button"
            onClick={handleBuyNow}
            className={cn(
              "btn btn-buy",
              isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm w-full sm:flex-1" : "h-9 px-3.5 text-xs"
            )}
          >
            <Zap className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4", "text-[#ff8a7f] fill-[#ff8a7f]")} />
            <span>{t("common.buyNow", "Buy Now")}</span>
          </button>
        ) : (
          /* No listed price (or no product): the factory quotes on request */
          <Link
            href={productSlug ? `/rfq/new?product=${productSlug}` : "/rfq/new"}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "btn btn-primary",
              isSmall ? "h-8 px-3 text-xs" : isLarge ? "h-12 px-6 text-sm w-full sm:flex-1" : "h-9 px-3.5 text-xs"
            )}
          >
            <FileText className={cn(isSmall ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <span>{t("product.actions.requestQuote")}</span>
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
