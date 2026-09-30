"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShoppingCart, X } from "lucide-react";
import { formatPriceInr } from "@/shared/lib/format";
import type { OrderRequest } from "@/entities/order";
import { getApi } from "@/shared/api";
import { ApiError } from "@/shared/api/http-api";
import { placeOrderAction } from "./actions";
import { defaultOrderQuantity } from "./order-status";
import { useTranslations } from "next-intl";

type Props = {
  productSlug: string;
  /** Enables "Add to cart" as an alternative to sending the request now. */
  productId?: string;
  productName?: string;
  priceInr?: number;
  unit?: string;
  moq?: string | number;
  onClose: () => void;
};

/**
 * Buyer sends an order request. No payment: the factory is notified, gets the buyer's
 * contact details, and follows up; the buyer tracks progress under /orders.
 */
export function OrderRequestModal({ productSlug, productId, productName, priceInr, unit = "Unit", moq, onClose }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(() => defaultOrderQuantity(moq));
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<OrderRequest | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const minQuantity = defaultOrderQuantity(moq);
  const estimate = priceInr !== undefined && quantity > 0 ? priceInr * quantity : undefined;

  function goToLogin() {
    // Come back to this product with the order form open after signing in
    const params = new URLSearchParams(searchParams.toString());
    params.set("order", "1");
    const next = pathname.startsWith("/products/") ? `${pathname}?${params}` : `/products/${productSlug}?order=1`;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }

  async function handleAddToCart() {
    if (!productId || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      await getApi().orders.addToCart(productId, quantity);
      setAddedToCart(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return goToLogin();
      setError(err instanceof Error ? err.message : t("orders.request.couldNotAddToCart"));
    }
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    const result = await placeOrderAction({ productSlug, quantity, note });
    if (result.ok) {
      setPlaced(result.data);
    } else if (result.needsLogin) {
      goToLogin();
      return;
    } else {
      setError(result.error);
    }
    setStatus("idle");
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        e.stopPropagation();
        if (status !== "sending") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t("orders.sendOrderRequest")}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{placed ? t("orders.request.orderRequestSent") : t("orders.sendOrderRequest")}</h2>
              <p className="text-xs text-ink-muted">{t("orders.request.noPaymentNowTheFactory")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "sending"}
            aria-label={t("common.close")}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-canvas hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {placed ? (
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="text-sm text-emerald-900">
                <p className="font-bold">{t("orders.request.reference")} {placed.referenceNumber}</p>
                <p className="mt-1 text-xs leading-relaxed">
                  {placed.manufacturer.name || t("orders.request.theFactory")} {t("orders.request.hasBeenNotifiedAbout")} {placed.quantity.toLocaleString("en-IN")}{" "}
                  {t("orders.request.unitOfProduct", { unit: placed.unit ?? unit, product: placed.productName })}{t("orders.request.theyWillContactYouTo")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary px-4 py-2 text-xs"
              >
                {t("common.close")}
              </button>
              <Link
                href="/orders"
                className="btn btn-primary px-4 py-2 text-xs"
              >
                {t("orders.request.viewMyOrders")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="rounded-xl border border-line bg-canvas p-3 text-xs">
              <p className="font-bold text-neutral-900">{productName ?? t("orders.request.selectedProduct")}</p>
              {priceInr !== undefined && (
                <p className="mt-0.5 text-ink-muted">
                  {t("orders.request.listedAt")} <strong className="text-neutral-900">{formatPriceInr(priceInr)}</strong> / {unit}
                  {moq !== undefined && <> {t("orders.request.moq")} {typeof moq === "number" ? `${moq} ${unit}` : moq}</>}
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                {t("orders.request.quantity")}{unit}) <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                required
                min={1}
                max={1_000_000}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.floor(Number(e.target.value)))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-bold text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
              {quantity < minQuantity && (
                <span className="mt-1 block text-[11px] font-semibold text-amber-700">
                  {t("orders.request.belowTheListedMoqThe")}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                {t("orders.request.noteToTheFactoryOptional")}
              </span>
              <textarea
                rows={3}
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("orders.request.specsDeliveryPortTimelineCustomization")}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </label>

            {estimate !== undefined && (
              <p className="text-xs text-ink-muted">
                {t("orders.request.estimatedValue")} <strong className="text-neutral-900">{formatPriceInr(estimate)}</strong> {t("orders.request.atListingPriceTheFinal")}
              </p>
            )}
            <p className="text-[11px] text-ink-muted">
              {t("orders.request.yourNameCompanyEmailAnd")}
            </p>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            {addedToCart && (
              <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {t("orders.request.addedToYourCart")}{" "}
                <Link href="/cart" className="underline">
                  {t("orders.request.viewCart")}
                </Link>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              {productId && (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={status === "sending" || quantity < 1}
                  className="mr-auto rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas disabled:opacity-50"
                >
                  {t("common.addToCart")}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={status === "sending"}
                className="btn btn-secondary px-4 py-2 text-xs disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={status === "sending" || quantity < 1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
              >
                {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                <span>{status === "sending" ? t("common.sending") : t("orders.sendOrderRequest")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
