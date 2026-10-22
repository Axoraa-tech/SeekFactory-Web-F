"use client";

import { useState } from "react";
import { FileText, Loader2, Paperclip, ShoppingBag, X } from "lucide-react";
import type { MessageAttachment } from "@/shared/api/contracts";
import type { MessageOrderContext } from "@/entities/message";
import type { OrderRequest } from "@/entities/order";
import { ORDER_STATUS_META } from "@/features/orders/order-status";
import { attachmentHref, isImageAttachment, isPdfAttachment } from "@/shared/lib/chat";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import { AttachmentViewer } from "./attachment-viewer";

type Tone = "own" | "other";

/** Image preview or file card for a chat attachment; opens it in the in-page viewer. */
export function MessageAttachmentView({ attachment, tone }: { attachment: MessageAttachment; tone: Tone }) {
  const [open, setOpen] = useState(false);
  const href = attachmentHref(attachment.url);
  const image = isImageAttachment(attachment);
  const pdf = isPdfAttachment(attachment);
  const viewer =
    open && href ? (
      <AttachmentViewer href={href} name={attachment.name} kind={image ? "image" : pdf ? "pdf" : "file"} onClose={() => setOpen(false)} />
    ) : null;

  if (href && image) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="mt-2 block cursor-zoom-in" title={attachment.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={href}
            alt={attachment.name}
            className="max-h-56 max-w-full rounded-xl border border-black/10 object-contain bg-white"
          />
        </button>
        {viewer}
      </>
    );
  }

  const Icon = pdf ? FileText : Paperclip;
  const body = (
    <>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-bold">{attachment.name}</p>
        <p className="text-[10px] opacity-80">{[pdf ? "PDF" : null, attachment.size].filter(Boolean).join(" • ")}</p>
      </div>
    </>
  );
  const className = cn(
    "mt-2 flex w-full items-center gap-2 rounded-xl border p-2 text-xs",
    tone === "own" ? "border-white/25 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-800",
    href && "hover:opacity-90",
  );
  return href ? (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {body}
      </button>
      {viewer}
    </>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** The picked (not yet sent) attachment above the input: a photo thumbnail, or the file name. */
export function PendingAttachmentPreview({
  attachment,
  localPreviewUrl,
  uploading,
  onRemove,
}: {
  attachment: MessageAttachment | null;
  /** Object URL of the picked photo, shown while it uploads. */
  localPreviewUrl?: string | null;
  uploading: boolean;
  onRemove: () => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const uploadedHref = attachment ? attachmentHref(attachment.url) : undefined;
  const src = localPreviewUrl || (attachment && isImageAttachment(attachment) ? uploadedHref : undefined);
  if (!src) return null;
  return (
    <div className="flex items-center gap-3 border-t border-slate-100 bg-white px-4 py-2">
      <button type="button" onClick={() => setOpen(true)} className="relative shrink-0 cursor-zoom-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={attachment?.name ?? ""} className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/45">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </span>
        )}
      </button>
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-bold text-slate-800">{uploading ? t("chat.uploadingPhoto") : t("chat.photoReadyToSend")}</p>
        <p className="truncate text-slate-500">{t("chat.addCaptionOrSend")}</p>
      </div>
      {!uploading && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("common.remove")}
          title={t("common.remove")}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {open && <AttachmentViewer href={src} name={attachment?.name ?? ""} kind="image" onClose={() => setOpen(false)} />}
    </div>
  );
}

/** "Re: ORD-2026-XXXX · product" tag shown above a message sent with order context. */
export function MessageOrderTag({ order, tone }: { order: MessageOrderContext; tone: Tone }) {
  const t = useTranslations();
  const status = order.status && order.status in ORDER_STATUS_META
    ? t(ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META].label)
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
        <strong>{t("chat.re")} {order.referenceNumber}</strong> · {order.productName}
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
  const t = useTranslations();
  if (orders.length === 0) return null;
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
      <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-amber-600" />
      <span className="shrink-0">{t("chat.aboutOrder")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 max-w-[260px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 focus:border-brand-blue focus:outline-hidden"
      >
        <option value="">{t("chat.generalNoSpecificOrder")}</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.referenceNumber} · {order.productName.length > 28 ? `${order.productName.slice(0, 28)}…` : order.productName}
          </option>
        ))}
      </select>
    </label>
  );
}
