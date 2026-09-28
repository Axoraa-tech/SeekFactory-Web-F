"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import { getApi } from "@/shared/api";
import type { OrderRequest } from "@/entities/order";
import { cn } from "@/shared/lib/cn";
import { formatRelativeTime } from "@/shared/lib/format";
import { ORDER_STATUS_META, ORDER_STEPS, PAYMENT_NOTE, formatMoney } from "@/features/orders/order-status";

/** What the buyer is expected to pay: the quoted total, the listing estimate, or nothing yet. */
function orderTotal(order: OrderRequest): string {
  if (order.quotedTotal != null) return formatMoney(order.quotedTotal, order.currency || "INR");
  if (order.estimatedTotalInr != null) return formatMoney(order.estimatedTotalInr, "INR");
  return "Price on request";
}

type Props = {
  initialOrders: OrderRequest[];
  /** Reference numbers just placed, for the confirmation banner. */
  placed: string[];
};

export function OrdersList({ initialOrders, placed }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancel = async (order: OrderRequest) => {
    if (!window.confirm(`Cancel order request ${order.referenceNumber}?`)) return;
    setCancelling(order.id);
    setError(null);
    try {
      const updated = await getApi().orders.cancel(order.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel the order");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="space-y-4">
      {placed.length > 0 && (
        <div className="flex gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Order request sent: {placed.join(", ")}</p>
            <p className="mt-0.5">{PAYMENT_NOTE}</p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center space-y-3 shadow-2xs">
          <Package className="mx-auto h-8 w-8 text-ink-faint" />
          <p className="text-sm font-bold text-ink">No orders yet</p>
          <p className="text-xs text-ink-muted">Order requests you send, or quotes you accept on your RFQs, appear here.</p>
          <Link
            href="/explore"
            className="btn btn-primary inline-flex h-9 items-center px-5 text-xs"
          >
            Explore products
          </Link>
        </div>
      ) : (
        orders.map((order) => {
          const status = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING;
          const step = ORDER_STEPS.indexOf(order.status);
          return (
            <article key={order.id} id={order.id} className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink font-mono">{order.referenceNumber}</p>
                  <p className="text-[11px] text-ink-muted">
                    {formatRelativeTime(order.createdAt)} •{" "}
                    <Link href={`/manufacturers/${order.manufacturer.slug}`} className="font-semibold text-brand-blue hover:underline">
                      {order.manufacturer.name}
                    </Link>
                    {order.source === "RFQ_QUOTE" ? " • From an accepted RFQ quote" : ""}
                  </p>
                </div>
                <span title={status.hint} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", status.className)}>
                  {status.label}
                </span>
              </header>

              <div className="flex items-center gap-3 px-4 py-3">
                {order.productImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.productImageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas">
                    <Package className="h-5 w-5 text-ink-faint" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {order.productSlug ? (
                    <Link href={`/products/${order.productSlug}`} className="block text-xs font-bold text-ink hover:text-brand-blue line-clamp-1">
                      {order.productName}
                    </Link>
                  ) : (
                    <p className="text-xs font-bold text-ink line-clamp-1">{order.productName}</p>
                  )}
                  <p className="text-[11px] text-ink-muted">
                    {order.quantity} {order.unit}
                    {order.unitPriceInr != null && order.quotedTotal == null ? ` × ${formatMoney(order.unitPriceInr, "INR")}` : ""}
                  </p>
                </div>
              </div>

              {order.sellerNote && (
                <p className="mx-4 mb-1 rounded-lg bg-blue-50/70 px-3 py-2 text-[11px] text-slate-700">
                  <span className="font-bold text-ink">{order.manufacturer.name}:</span> {order.sellerNote}
                </p>
              )}

              {order.status !== "CANCELLED" && (
                <ol className="flex items-center gap-1 px-4 pt-3" aria-label="Order progress">
                  {ORDER_STEPS.map((s, i) => (
                    <li
                      key={s}
                      className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-brand-blue" : "bg-slate-200")}
                      title={ORDER_STATUS_META[s].label}
                    />
                  ))}
                </ol>
              )}

              <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs">
                <div className="min-w-0 text-ink-muted">
                  {order.deliveryAddress && (
                    <p className="line-clamp-1">
                      Deliver to <span className="font-semibold text-ink">{order.contactName}</span>, {order.deliveryAddress}
                    </p>
                  )}
                  {order.status === "CANCELLED" && order.cancelReason && (
                    <p className="flex items-center gap-1 text-rose-600">
                      <XCircle className="h-3.5 w-3.5" /> {order.cancelReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-extrabold text-ink tabular-nums">{orderTotal(order)}</span>
                  <Link
                    href={`/messages?with=${order.manufacturer.slug}`}
                    className="btn btn-secondary px-3 py-1.5"
                  >
                    Chat
                  </Link>
                  {order.cancellable && (
                    <button
                      type="button"
                      disabled={cancelling === order.id}
                      onClick={() => cancel(order)}
                      className="btn btn-secondary text-brand-red-dark hover:border-brand-red/40 px-3 py-1.5 disabled:opacity-50"
                    >
                      {cancelling === order.id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </footer>
            </article>
          );
        })
      )}
    </div>
  );
}
