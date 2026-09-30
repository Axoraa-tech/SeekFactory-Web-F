"use client";

import { useRef } from "react";
import Link from "next/link";
import { Send, Paperclip, Building2, FileText, CheckCheck, ChevronLeft, Loader2, X, MessageSquare } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import { CHAT_ATTACHMENT_ACCEPT, formatChatTime } from "@/shared/lib/chat";
import type { MessageAttachment } from "@/shared/api/contracts";
import type { OrderRequest } from "@/entities/order";
import type { ThreadWithMessages } from "./chat-types";
import { MessageAttachmentView, MessageOrderTag, OrderContextPicker } from "./message-extras";
import { useTranslations } from "next-intl";

type Props = {
  activeThread: ThreadWithMessages;
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
  attachmentUploading: boolean;
  attachmentError: string | null;
  onPickFile: (file: File | undefined) => void;
  onClearAttachment: () => void;
  /** Orders between this buyer and factory, for the "About order" picker. */
  orders: OrderRequest[];
  contextOrderId: string;
  onContextChange: (orderId: string) => void;
  sendError: string | null;
};

export function ChatConversationPane({
  activeThread,
  mobileShowChat,
  onBackToThreads,
  isTyping,
  messagesEndRef,
  quickInquiries,
  onSendMessage,
  inputMessage,
  onInputChange,
  attachment,
  attachmentUploading,
  attachmentError,
  onPickFile,
  onClearAttachment,
  orders,
  contextOrderId,
  onContextChange,
  sendError,
}: Props) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (inputMessage.trim().length > 0 || attachment !== null) && !attachmentUploading;

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

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={activeThread.manufacturer.logoUrl}
            alt={activeThread.manufacturer.name}
            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {activeThread.manufacturer.name}
              </h3>
              {activeThread.manufacturer.verified && (
                <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {[activeThread.manufacturer.location, activeThread.manufacturer.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/manufacturers/${activeThread.manufacturer.slug}`}
            className="btn btn-secondary hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{t("chat.visitPlant")}</span>
          </Link>
          <Link
            href="/rfq/new"
            className="btn btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t("nav.postRfq")}</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {activeThread.messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm text-center text-slate-500">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">{t("chat.startTheConversation")}</p>
            <p className="mt-1 text-xs">
              {t("chat.ask")} {activeThread.manufacturer.name} {t("chat.aboutPricingSpecsOrDelivery")}
            </p>
          </div>
        )}

        {activeThread.messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={cn("flex gap-2.5 max-w-[82%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              {!isUser && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeThread.manufacturer.logoUrl}
                  alt=""
                  className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                />
              )}

              <div className="space-y-1 min-w-0">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                    isUser
                      ? "bg-brand-blue text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                  )}
                >
                  {msg.order && <MessageOrderTag order={msg.order} tone={isUser ? "own" : "other"} />}
                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  {msg.attachment && <MessageAttachmentView attachment={msg.attachment} tone={isUser ? "own" : "other"} />}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] text-slate-400 px-1 font-medium",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <span>{formatChatTime(msg.time)}</span>
                  {isUser && <CheckCheck className="h-3 w-3 text-brand-blue" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span>{activeThread.manufacturer.name} {t("chat.isTyping")}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickInquiries.map((template, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(undefined, template)}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue transition-colors shadow-2xs whitespace-nowrap"
          >
            {template}
          </button>
        ))}
      </div>

      {orders.length > 0 && (
        <div className="px-4 py-1.5 bg-white border-t border-slate-100">
          <OrderContextPicker orders={orders} value={contextOrderId} onChange={onContextChange} />
        </div>
      )}

      {(attachment || attachmentUploading || attachmentError || sendError) && (
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
              className="font-bold text-red-500 hover:underline text-[11px] ml-2 inline-flex items-center gap-0.5"
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
          disabled={attachmentUploading}
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
          placeholder={`Message ${activeThread.manufacturer.name}...`}
          className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm outline-none focus:border-brand-blue focus:bg-white transition-colors"
        />

        <button
          type="submit"
          disabled={!canSend}
          className="btn btn-primary h-10 px-4 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("common.send")}</span>
        </button>
      </form>
    </div>
  );
}
