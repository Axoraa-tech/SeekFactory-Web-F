"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, MessageSquare, Phone, Search, ShoppingBag } from "lucide-react";
import type { OrderRequest, OrderStatus } from "@/entities/order";
import { ORDER_STATUSES, ORDER_STATUS_META, formatMoney } from "@/features/orders/order-status";
import { formatPriceInr } from "@/shared/lib/format";
import { ProductThumb } from "@/features/orders/product-thumb";

type Props = {
  orders: OrderRequest[];
  /** Persists the change; rejects with a user-facing message on failure. */
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  /** Opens the chat with this order's buyer (rejects with a user-facing message on failure). */
  onChatWithBuyer?: (order: OrderRequest) => Promise<void>;
};

function formatDate(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function OrdersTab({ orders, onUpdateStatus, onChatWithBuyer }: Props) {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = orders.filter((order) => {
    const matchesStatus = filter === "ALL" || order.status === filter;
    const matchesQuery =
      !q ||
      order.referenceNumber.toLowerCase().includes(q) ||
      order.productName.toLowerCase().includes(q) ||
      order.buyer.name.toLowerCase().includes(q) ||
      (order.buyer.companyName ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex flex-wrap items-center gap-2">
          <span>Buyer Order Requests</span>
          <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.2 text-xs font-bold text-red-600">
            {orders.filter((o) => o.status === "PENDING").length} New
          </span>
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Buyers who clicked <strong>Order</strong> on your products. No payment is taken on SeekFactory: contact the
          buyer, agree terms, and keep the status updated so they can follow along.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, product or buyer..."
            className="w-full rounded-xl border border-line bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-hidden shadow-xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", ...ORDER_STATUSES] as const).map((status) => {
            const count = status === "ALL" ? orders.length : orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
                  filter === status
                    ? "bg-brand-blue text-white"
                    : "bg-white border border-line text-neutral-700 hover:bg-canvas"
                }`}
              >
                {status === "ALL" ? "All" : ORDER_STATUS_META[status].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-3.5 sf-stagger">
        {visible.map((order) => (
          <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} onChatWithBuyer={onChatWithBuyer} />
        ))}

        {visible.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
            <ShoppingBag className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">
              {orders.length === 0 ? "No order requests yet" : "No orders in this view"}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              When a buyer clicks Order on one of your products, it appears here and you get a notification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
  onChatWithBuyer,
}: {
  order: OrderRequest;
  onUpdateStatus: Props["onUpdateStatus"];
  onChatWithBuyer?: Props["onChatWithBuyer"];
}) {
  const [openingChat, setOpeningChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  async function handleChat() {
    if (!onChatWithBuyer || openingChat) return;
    setOpeningChat(true);
    setChatError(null);
    try {
      await onChatWithBuyer(order);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not open the chat.");
      setOpeningChat(false);
    }
  }
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState(order.sellerNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = status !== order.status || note.trim() !== (order.sellerNote ?? "");
  const meta = ORDER_STATUS_META[order.status];

  async function handleSave() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdateStatus(order.id, status, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`sf-lift rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3 hover:border-brand-blue/60 ${
        order.status === "CANCELLED" || order.status === "COMPLETED" ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      {/* Top: product + status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <ProductThumb src={order.productImageUrl} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-brand-blue">
              {order.referenceNumber} • Received {formatDate(order.createdAt)}
            </p>
            {order.productSlug ? (
              <Link
                href={`/products/${order.productSlug}`}
                target="_blank"
                className="text-sm font-bold text-neutral-900 hover:text-brand-blue hover:underline"
              >
                {order.productName}
              </Link>
            ) : (
              <p className="text-sm font-bold text-neutral-900">{order.productName}</p>
            )}
            <p className="text-xs text-neutral-600 mt-0.5">
              Quantity: <strong className="text-neutral-900">{order.quantity.toLocaleString("en-IN")} {order.unit}</strong>
              {order.quotedTotal != null ? (
                <>
                  {" "}• Accepted quote{" "}
                  <strong className="text-neutral-900">{formatMoney(order.quotedTotal, order.currency || "INR")}</strong>
                </>
              ) : order.estimatedTotalInr !== undefined && (
                <>
                  {" "}• Est. value <strong className="text-neutral-900">{formatPriceInr(order.estimatedTotalInr)}</strong>
                  <span className="text-ink-muted"> at listing price</span>
                </>
              )}
            </p>
          </div>
        </div>
        <span
          className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${meta.className}`}
          title={meta.hint}
        >
          {meta.label}
        </span>
      </div>

      {/* Buyer contact */}
      <div className="rounded-xl bg-canvas p-3.5 border border-line grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <p className="font-bold text-neutral-900">
            {order.buyer.name}
            {order.buyer.companyName && <span className="font-medium text-ink-muted"> · {order.buyer.companyName}</span>}
          </p>
          {order.buyer.country && <p className="text-ink-muted">{order.buyer.country}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
          {order.buyer.email && (
            <a href={`mailto:${order.buyer.email}?subject=${encodeURIComponent(`Your order ${order.referenceNumber}`)}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline">
              <Mail className="h-3.5 w-3.5" /> {order.buyer.email}
            </a>
          )}
          {order.buyer.phone && (
            <a href={`tel:${order.buyer.phone}`} className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline">
              <Phone className="h-3.5 w-3.5" /> {order.buyer.phone}
            </a>
          )}
          {onChatWithBuyer && (
            <button
              type="button"
              onClick={handleChat}
              disabled={openingChat}
              className="btn btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] disabled:opacity-60"
            >
              {openingChat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
              Chat with buyer
            </button>
          )}
        </div>
        {chatError && (
          <p role="alert" className="sm:col-span-2 text-[11px] font-semibold text-red-600">
            {chatError}
          </p>
        )}
        {order.buyerNote && (
          <p className="sm:col-span-2 pt-2 border-t border-line text-neutral-700 leading-relaxed">
            &ldquo;{order.buyerNote}&rdquo;
          </p>
        )}
        {/* Delivery contact the buyer entered at checkout (cart, Buy Now or accepted quote) */}
        {(order.deliveryAddress || order.contactPhone) && (
          <p className="sm:col-span-2 pt-2 border-t border-line text-neutral-700 leading-relaxed">
            <span className="font-bold text-neutral-900">Deliver to:</span>{" "}
            {[order.contactName, order.contactPhone, order.deliveryAddress].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Status control */}
      <div className="flex flex-col md:flex-row md:items-end gap-2.5">
        <label className="md:w-56">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 focus:border-brand-blue focus:outline-hidden"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Note to buyer (optional)
          </span>
          <input
            type="text"
            value={note}
            maxLength={2000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Sent revised pricing by email"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="btn btn-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>{saving ? "Saving…" : "Update status"}</span>
        </button>
      </div>
      {(error || saved || order.statusUpdatedAt) && (
        <p className={`text-[11px] font-semibold ${error ? "text-red-600" : saved ? "text-emerald-600" : "text-ink-muted"}`} role={error ? "alert" : undefined}>
          {error ?? (saved ? "Saved. The buyer has been notified." : `Status last changed ${formatDate(order.statusUpdatedAt)}`)}
        </p>
      )}
    </div>
  );
}
