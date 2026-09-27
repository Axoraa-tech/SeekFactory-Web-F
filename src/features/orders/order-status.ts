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
    label: "New",
    hint: "Waiting for the factory to respond",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CONTACTED: {
    label: "Contacted",
    hint: "The factory has reached out to the buyer",
    className: "bg-blue-50 text-brand-blue border-blue-200",
  },
  NEGOTIATING: {
    label: "In negotiation",
    hint: "Price, specs or delivery being discussed",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    hint: "Deal agreed; production or dispatch arranged",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  COMPLETED: {
    label: "Completed",
    hint: "Delivered / fulfilled",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
  CANCELLED: {
    label: "Cancelled",
    hint: "Dropped by either side",
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
