"use client";

import { useRef } from "react";
import Link from "next/link";
import { Send, Paperclip, Building2, FileText, CheckCheck, ChevronLeft, Loader2, X, MessageSquare, Check } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import { CHAT_ATTACHMENT_ACCEPT, formatChatTime } from "@/shared/lib/chat";
import type { MessageAttachment } from "@/shared/api/contracts";
import type { OrderRequest } from "@/entities/order";
import type { ChatMessage, ThreadWithMessages } from "./chat-types";
import { MessageAttachmentView, MessageOrderTag, OrderContextPicker, PendingAttachmentPreview } from "./message-extras";
import { DeletedMessageBubble, EditingBar, MessageActionsMenu, canDeleteMessage, canEditMessage } from "./message-actions";
import { useLocale, useTranslations } from "next-intl";
import { useSupplierName } from "@/features/subscription";
import { formatRelativeTime } from "@/shared/lib/format";

import type { BuyerProfile } from "@/entities/user";

type Props = {
  activeThread: ThreadWithMessages;
  currentUser?: BuyerProfile | null;
  isSupplier?: boolean;
  mobileShowChat: boolean;
  onBackToThreads: () => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  quickInquiries: string[];
  onSendMessage: (e?: React.FormEvent, customText?: string) => void;
  inputMessage: string;
  onInputChange: (value: string) => void;
  /** Uploaded (not yet sent) attachment. */
  attachment: MessageAttachment | null;
  /** Local preview of a picked photo while it uploads. */
  attachmentPreviewUrl?: string | null;
  attachmentUploading: boolean;
  attachmentError: string | null;
  onPickFile: (file: File | undefined) => void;
  onClearAttachment: () => void;
  /** Orders between this buyer and factory, for the "About order" picker. */
  orders: OrderRequest[];
  contextOrderId: string;
  onContextChange: (orderId: string) => void;
  sendError: string | null;
  /** Your own message being edited in the input, if any. */
  editing?: ChatMessage | null;
  onStartEdit?: (message: ChatMessage) => void;
  onCancelEdit?: () => void;
  onDeleteMessage?: (message: ChatMessage) => void;
};

export function ChatConversationPane({
  activeThread,
  currentUser,
  isSupplier = false,
  mobileShowChat,
  onBackToThreads,
  isTyping,
  messagesEndRef,
  quickInquiries,
  onSendMessage,
  inputMessage,
  onInputChange,
  attachment,
  attachmentPreviewUrl,
  attachmentUploading,
  attachmentError,
  onPickFile,
  onClearAttachment,
  orders,
  contextOrderId,
  onContextChange,
  sendError,
  editing,
  onStartEdit,
  onCancelEdit,
  onDeleteMessage,
}: Props) {
  const t = useTranslations();
  const supplierName = useSupplierName();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = editing
    ? inputMessage.trim().length > 0
    : (inputMessage.trim().length > 0 || attachment !== null) && !attachmentUploading;
  const showPhotoPreview = Boolean(attachmentPreviewUrl);

  const counterpartName = isSupplier
    ? activeThread.buyerName || activeThread.buyerCompany || t("seller.messages.buyer")
    : supplierName(activeThread.manufacturer.name);
  const counterpartAvatar = isSupplier
    ? activeThread.buyerAvatarUrl
    : activeThread.manufacturer.logoUrl;

  return (
    <div
      className={cn(
        "flex-1 flex flex-col bg-white overflow-hidden",
        !mobileShowChat ? "hidden md:flex" : "flex"
      )}
    >
      <div className="p-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToThreads}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label={t("chat.backToThreads")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {counterpartAvatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img loading="lazy" decoding="async" src={counterpartAvatar}
              alt={counterpartName}
              className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-slate-200 flex items-center justify-center font-bold text-xs text-brand-blue shadow-2xs shrink-0">
              {(counterpartName || "B").slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {counterpartName}
              </h3>
              {!isSupplier && activeThread.manufacturer.verified && (
                <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {activeThread.counterpartOnline ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t("chat.online")}
                </span>
              ) : (
                <span>
                  {activeThread.counterpartLastSeenAt
                    ? t("chat.lastSeen", { time: formatRelativeTime(activeThread.counterpartLastSeenAt, locale) })
                    : t("chat.offline")}
                </span>
              )}
              {isSupplier ? (
                activeThread.buyerCompany ? (
                  <span>{" · "}{activeThread.buyerCompany}</span>
                ) : null
              ) : (
                [activeThread.manufacturer.location, activeThread.manufacturer.country].filter(Boolean).length > 0 && (
                  <span>
                    {" · "}
                    {[activeThread.manufacturer.location, activeThread.manufacturer.country].filter(Boolean).join(", ")}
                  </span>
                )
              )}
            </p>
          </div>
        </div>

        {!isSupplier && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Link prefetch={false}
              href={`/manufacturers/${activeThread.manufacturer.slug}`}
              title={t("chat.visitPlant")}
              aria-label={t("chat.visitPlant")}
              className="sf-btn-nav hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{t("chat.visitPlant")}</span>
            </Link>
            <Link
              href="/rfq/new"
              title={t("nav.postRfq")}
              aria-label={t("nav.postRfq")}
              className="sf-btn-commit inline-flex items-center gap-1 rounded-xl bg-brand-blue px-2.5 xl:px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{t("nav.postRfq")}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {activeThread.messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm text-center text-slate-500">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">{t("chat.startTheConversation")}</p>
            <p className="mt-1 text-xs">
              {isSupplier
                ? t("seller.messages.sendAMessageToStart")
                : `${t("chat.ask")} ${counterpartName} ${t("chat.aboutPricingSpecsOrDelivery")}`}
            </p>
          </div>
        )}

        {activeThread.messages.map((msg) => {
          const isOwn =
            msg.senderId && currentUser?.id
              ? msg.senderId === currentUser.id
              : isSupplier
              ? msg.sender === "factory" || msg.senderType === "FACTORY"
              : msg.sender === "user" || msg.senderType === "USER";

          return (
            <div
              key={msg.id}
              className={cn("flex gap-2.5 max-w-[82%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              {!isOwn && (
                counterpartAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={counterpartAvatar}
                    alt=""
                    className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-lg bg-blue-50 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-brand-blue shrink-0 mt-0.5">
                    {(counterpartName || "B").slice(0, 2).toUpperCase()}
                  </div>
                )
              )}

              <div className="space-y-1 min-w-0">
                {msg.deleted ? (
                  <DeletedMessageBubble own={isOwn} />
                ) : (
                <div className={cn("group flex items-start gap-1", isOwn && "flex-row-reverse")}>
                <div
                  className={cn(
                    "min-w-0 rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                    isOwn
                      ? "bg-brand-blue text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs",
                    editing?.id === msg.id && "ring-2 ring-brand-blue/40 ring-offset-1"
                  )}
                >
                  {msg.order && <MessageOrderTag order={msg.order} tone={isOwn ? "own" : "other"} />}
                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  {msg.attachment && <MessageAttachmentView attachment={msg.attachment} tone={isOwn ? "own" : "other"} />}
                </div>
                {isOwn && onDeleteMessage && canDeleteMessage(msg) && (
                  <MessageActionsMenu
                    canEdit={Boolean(onStartEdit) && canEditMessage(msg)}
                    onEdit={() => onStartEdit?.(msg)}
                    onDelete={() => onDeleteMessage(msg)}
                  />
                )}
                </div>
                )}

                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] text-slate-400 px-1 font-medium",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.editedAt && !msg.deleted && <span>{t("chat.edited")} ·</span>}
                  <span>{formatChatTime(msg.time)}</span>
                  {isOwn && !msg.deleted && <CheckCheck className="h-3 w-3 text-brand-blue" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span>{counterpartName} {t("chat.isTyping")}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {quickInquiries.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickInquiries.map((template, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(undefined, template)}
              className="sf-btn-commit shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue transition-colors shadow-2xs whitespace-nowrap"
            >
              {template}
            </button>
          ))}
        </div>
      )}

      {orders.length > 0 && !editing && (
        <div className="px-4 py-1.5 bg-white border-t border-slate-100">
          <OrderContextPicker orders={orders} value={contextOrderId} onChange={onContextChange} />
        </div>
      )}

      {showPhotoPreview && !editing && (
        <PendingAttachmentPreview
          attachment={attachment}
          localPreviewUrl={attachmentPreviewUrl}
          uploading={attachmentUploading}
          onRemove={onClearAttachment}
        />
      )}

      {editing && onCancelEdit && <EditingBar original={editing.text} onCancel={onCancelEdit} />}

      {((!showPhotoPreview && (attachment || attachmentUploading)) || attachmentError || sendError) && (
        <div
          className={cn(
            "px-4 py-1.5 border-t flex items-center justify-between text-xs",
            attachmentError || sendError ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50/60 border-blue-100 text-brand-blue"
          )}
          role={attachmentError || sendError ? "alert" : undefined}
        >
          <span className="flex items-center gap-1.5 font-semibold truncate">
            {attachmentUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Paperclip className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">
              {attachmentError ?? sendError ?? (attachmentUploading ? t("common.uploading") : `Attached: ${attachment?.name} (${attachment?.size})`)}
            </span>
          </span>
          {attachment && !attachmentUploading && (
            <button
              type="button"
              onClick={onClearAttachment}
              className="sf-btn-danger font-bold text-red-500 hover:underline text-[11px] ml-2 inline-flex items-center gap-0.5"
            >
              <X className="h-3 w-3" /> {t("common.remove")}
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => onSendMessage(e)}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={CHAT_ATTACHMENT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            onPickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachmentUploading || Boolean(editing)}
          title={t("chat.attachAnImageOrPdf")}
          aria-label={t("chat.attachAnImageOrPdf")}
          className={cn(
            "p-2 rounded-xl border transition-colors shadow-2xs disabled:opacity-50",
            attachment
              ? "bg-blue-100 text-brand-blue border-brand-blue"
              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
          )}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          maxLength={5000}
          placeholder={`Message ${counterpartName}...`}
          className="flex-1 min-w-0 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm outline-none focus:border-brand-blue focus:bg-white transition-colors"
        />

        <button
          type="submit"
          disabled={!canSend}
          className="sf-btn-commit h-10 shrink-0 px-4 rounded-xl bg-brand-blue text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs disabled:opacity-50"
        >
          {editing ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{editing ? t("chat.saveEdit") : t("common.send")}</span>
        </button>
      </form>
    </div>
  );
}
