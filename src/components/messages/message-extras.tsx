"use client";

import { ExternalLink, FileText, Paperclip, ShoppingBag } from "lucide-react";
import type { MessageAttachment } from "@/shared/api/contracts";
import type { MessageOrderContext } from "@/entities/message";
import type { OrderRequest } from "@/entities/order";
import { ORDER_STATUS_META } from "@/features/orders/order-status";
import { attachmentHref, isImageAttachment, isPdfAttachment } from "@/shared/lib/chat";
import { cn } from "@/shared/lib/cn";

type Tone = "own" | "other";

/** Image preview or file card for a chat attachment; opens the file in a new tab. */
export function MessageAttachmentView({ attachment, tone }: { attachment: MessageAttachment; tone: Tone }) {
  const href = attachmentHref(attachment.url);

  if (href && isImageAttachment(attachment)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 block" title={`Open ${attachment.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={href}
          alt={attachment.name}
          className="max-h-56 max-w-full rounded-xl border border-black/10 object-contain bg-white"
        />
      </a>
    );
  }

  const Icon = isPdfAttachment(attachment) ? FileText : Paperclip;
  const body = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{attachment.name}</p>
        <p className="text-[10px] opacity-80">
          {[isPdfAttachment(attachment) ? "PDF" : null, attachment.size].filter(Boolean).join(" • ")}
        </p>
      </div>
      {href && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />}
    </>
  );
  const className = cn(
    "mt-2 flex items-center gap-2 rounded-xl border p-2 text-xs",
    tone === "own" ? "border-white/25 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-800",
    href && "hover:opacity-90",
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** "Re: ORD-2026-XXXX · product" tag shown above a message sent with order context. */
export function MessageOrderTag({ order, tone }: { order: MessageOrderContext; tone: Tone }) {
  const status = order.status && order.status in ORDER_STATUS_META
    ? ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META].label
    : undefined;
  return (
    <div
      className={cn(
        "mb-1.5 flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]",
        tone === "own" ? "border-white/25 bg-white/10 text-white" : "border-amber-200 bg-amber-50 text-amber-900",
      )}
    >
      <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        <strong>Re: {order.referenceNumber}</strong> · {order.productName}
        {order.quantity !== undefined && ` · ${order.quantity} ${order.unit ?? ""}`}
        {status && ` · ${status}`}
      </span>
    </div>
  );
}

/** Lets the sender tag a message with one of the orders between these two parties. */
export function OrderContextPicker({
  orders,
  value,
  onChange,
}: {
  orders: OrderRequest[];
  value: string;
  onChange: (orderId: string) => void;
}) {
  if (orders.length === 0) return null;
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
      <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-amber-600" />
      <span className="shrink-0">About order:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 max-w-[260px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 focus:border-brand-blue focus:outline-hidden"
      >
        <option value="">General (no specific order)</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.referenceNumber} · {order.productName.length > 28 ? `${order.productName.slice(0, 28)}…` : order.productName}
          </option>
        ))}
      </select>
    </label>
  );
}
