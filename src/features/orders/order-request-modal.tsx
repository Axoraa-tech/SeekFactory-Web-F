"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShoppingCart, X } from "lucide-react";
import { formatPriceInr } from "@/shared/lib/format";
import type { OrderRequest } from "@/entities/order";
import { placeOrderAction } from "./actions";
import { defaultOrderQuantity } from "./order-status";

type Props = {
  productSlug: string;
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
export function OrderRequestModal({ productSlug, productName, priceInr, unit = "Unit", moq, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(() => defaultOrderQuantity(moq));
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<OrderRequest | null>(null);

  const minQuantity = defaultOrderQuantity(moq);
  const estimate = priceInr !== undefined && quantity > 0 ? priceInr * quantity : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    const result = await placeOrderAction({ productSlug, quantity, note });
    if (result.ok) {
      setPlaced(result.data);
    } else if (result.needsLogin) {
      // Come back to this product with the order form open after signing in
      const params = new URLSearchParams(searchParams.toString());
      params.set("order", "1");
      const next = pathname.startsWith("/products/") ? `${pathname}?${params}` : `/products/${productSlug}?order=1`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
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
      aria-label="Send order request"
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
              <h2 className="text-base font-bold text-neutral-900">{placed ? "Order request sent" : "Send order request"}</h2>
              <p className="text-xs text-ink-muted">No payment now: the factory contacts you to confirm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "sending"}
            aria-label="Close"
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
                <p className="font-bold">Reference {placed.referenceNumber}</p>
                <p className="mt-1 text-xs leading-relaxed">
                  {placed.manufacturer.name || "The factory"} has been notified about {placed.quantity.toLocaleString("en-IN")}{" "}
                  {placed.unit ?? unit} of {placed.productName}. They will contact you to confirm price, specs and
                  delivery. You&apos;ll get a notification whenever the status changes.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas"
              >
                Close
              </button>
              <Link
                href="/orders"
                className="rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark"
              >
                View my orders
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="rounded-xl border border-line bg-canvas p-3 text-xs">
              <p className="font-bold text-neutral-900">{productName ?? "Selected product"}</p>
              {priceInr !== undefined && (
                <p className="mt-0.5 text-ink-muted">
                  Listed at <strong className="text-neutral-900">{formatPriceInr(priceInr)}</strong> / {unit}
                  {moq !== undefined && <> • MOQ {typeof moq === "number" ? `${moq} ${unit}` : moq}</>}
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Quantity ({unit}) <span className="text-red-500">*</span>
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
                  Below the listed MOQ; the factory may still accept it.
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Note to the factory (optional)
              </span>
              <textarea
                rows={3}
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Specs, delivery port, timeline, customization..."
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </label>

            {estimate !== undefined && (
              <p className="text-xs text-ink-muted">
                Estimated value <strong className="text-neutral-900">{formatPriceInr(estimate)}</strong> at listing
                price; the final price is agreed with the factory.
              </p>
            )}
            <p className="text-[11px] text-ink-muted">
              Your name, company, email and phone are shared with this factory so they can contact you.
            </p>

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
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "sending" || quantity < 1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
              >
                {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                <span>{status === "sending" ? "Sending…" : "Send order request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
