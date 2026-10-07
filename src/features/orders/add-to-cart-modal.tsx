"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShoppingCart, X } from "lucide-react";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { getApi } from "@/shared/api";
import { ApiError } from "@/shared/api/http-api";
import { defaultOrderQuantity } from "./order-status";
import { useTranslations } from "next-intl";

type Props = {
  productSlug: string;
  productId: string;
  productName?: string;
  priceInr?: number;
  unit?: string;
  moq?: string | number;
  onClose: () => void;
};

const subscribeNever = () => () => {};

/**
 * Picks a quantity and puts the product in the buyer's cart. Order requests are sent from the
 * cart (one per product, with delivery details and notes); "Buy now" is the one-product shortcut.
 *
 * Rendered into document.body: seek cards create their own stacking/containing context, which
 * would otherwise trap a fixed overlay inside the card.
 */
export function AddToCartModal({ productSlug, productId, productName, priceInr, unit = "Unit", moq, onClose }: Props) {
  const t = useTranslations();
  // Same currency as the price on the card
  const { formatPrice } = useRegionalSettings();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [quantity, setQuantity] = useState(() => defaultOrderQuantity(moq));
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const minQuantity = defaultOrderQuantity(moq);
  const estimate = priceInr !== undefined && quantity > 0 ? priceInr * quantity : undefined;
  const moqLabel = moq === undefined || moq === "" ? null : typeof moq === "number" ? `${moq} ${unit}` : moq;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "sending") onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, status]);

  function goToLogin() {
    // Come back to this product with the dialog open after signing in
    const params = new URLSearchParams(searchParams.toString());
    params.set("order", "1");
    const next = pathname.startsWith("/products/") ? `${pathname}?${params}` : `/products/${productSlug}?order=1`;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || quantity < 1) return;
    setStatus("sending");
    setError(null);
    try {
      await getApi().orders.addToCart(productId, quantity);
      setAdded(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return goToLogin();
      setError(err instanceof Error ? err.message : t("orders.request.couldNotAddToCart"));
    }
    setStatus("idle");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        e.stopPropagation();
        if (status !== "sending") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t("orders.addToCart.title")}
    >
      <div
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {added ? t("orders.addToCart.added") : t("orders.addToCart.title")}
              </h2>
              <p className="text-xs text-ink-muted">{t("orders.addToCart.subtitle")}</p>
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

        {added ? (
          <div className="space-y-4 overflow-y-auto p-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-xs leading-relaxed text-emerald-900">
                {t("orders.addToCart.addedDetail", {
                  quantity: quantity.toLocaleString("en-IN"),
                  unit,
                  product: productName ?? t("orders.request.selectedProduct"),
                })}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas"
              >
                {t("orders.addToCart.continueBrowsing")}
              </button>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("orders.addToCart.viewCart")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5">
            <div className="rounded-xl border border-line bg-canvas p-3 text-xs">
              <p className="font-bold text-neutral-900">{productName ?? t("orders.request.selectedProduct")}</p>
              {(priceInr !== undefined || moqLabel) && (
                <p className="mt-0.5 text-ink-muted">
                  {priceInr !== undefined && t("orders.addToCart.listed", { price: formatPrice(priceInr), unit })}
                  {priceInr !== undefined && moqLabel && " · "}
                  {moqLabel && t("orders.addToCart.moq", { moq: moqLabel })}
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                {t("orders.addToCart.quantity", { unit })} <span className="text-red-500">*</span>
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

            {estimate !== undefined && (
              <p className="text-xs text-ink-muted">
                {t("orders.request.estimatedValue")} <strong className="text-neutral-900">{formatPrice(estimate)}</strong>{" "}
                {t("orders.request.atListingPriceTheFinal")}
              </p>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={status === "sending"}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={status === "sending" || quantity < 1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
              >
                {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                <span>{status === "sending" ? t("orders.addToCart.adding") : t("orders.addToCart.title")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
