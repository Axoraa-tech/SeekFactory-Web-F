import type { OrderStatus } from "@/entities/order";

/** Display order and labels for order request statuses (shared by buyer and seller views). */
export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONTACTED",
  "NEGOTIATING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; hint: string; className: string }> = {
  PENDING: {
    label: "orders.status.pending.label",
    hint: "orders.status.pending.hint",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CONTACTED: {
    label: "orders.status.contacted.label",
    hint: "orders.status.contacted.hint",
    className: "bg-blue-50 text-brand-blue border-blue-200",
  },
  NEGOTIATING: {
    label: "orders.status.negotiating.label",
    hint: "orders.status.negotiating.hint",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  CONFIRMED: {
    label: "orders.status.confirmed.label",
    hint: "orders.status.confirmed.hint",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  COMPLETED: {
    label: "orders.status.completed.label",
    hint: "orders.status.completed.hint",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
  CANCELLED: {
    label: "orders.status.cancelled.label",
    hint: "orders.status.cancelled.hint",
    className: "bg-neutral-100 text-neutral-500 border-neutral-200 line-through",
  },
};

/** Leading integer of an MOQ string like "50 pieces" → 50 (at least 1). */
export function defaultOrderQuantity(moq: string | number | undefined): number {
  if (typeof moq === "number") return Math.max(1, Math.floor(moq));
  const match = /\d[\d,]*/.exec(moq ?? "");
  const value = match ? Number(match[0].replace(/,/g, "")) : 1;
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/** The deal's progress, left to right (a cancelled request is shown on its own). */
export const ORDER_STEPS: OrderStatus[] = ["PENDING", "CONTACTED", "NEGOTIATING", "CONFIRMED", "COMPLETED"];

/** SeekFactory takes no payment; price and payment terms are agreed with the factory. */
export const PAYMENT_NOTE =
  "orders.paymentNote";

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
