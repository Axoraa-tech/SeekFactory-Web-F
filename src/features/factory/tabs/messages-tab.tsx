"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Search, Package, FileText, Sparkles, Paperclip, Loader2, X, MessageSquare } from "lucide-react";
import type { OrderRequest } from "@/entities/order";
import type { MessageAttachment } from "@/shared/api/contracts";
import { useChatAttachment } from "@/hooks/use-chat-attachment";
import { CHAT_ATTACHMENT_ACCEPT, formatChatTime } from "@/shared/lib/chat";
import { MessageAttachmentView, MessageOrderTag, OrderContextPicker } from "@/components/messages/message-extras";
import type { SellerConversation } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  conversations: SellerConversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  /** Rejects with a user-facing message if the message could not be sent. */
  onSendMessage: (conversationId: string, text: string, attachment?: MessageAttachment, orderId?: string) => Promise<void>;
  /** All of this factory's order requests; the picker shows the ones from the active buyer. */
  orders: OrderRequest[];
  /** Pre-selected order context when arriving from the Orders tab. */
  /** Pre-selects an order and/or pre-fills the composer when arriving from Orders or RFQs. */
  initialContext?: { conversationId: string; orderId?: string; draft?: string } | null;
  onContextConsumed?: () => void;
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "B"
  );
}

function Avatar({ url, name, size }: { url?: string; name: string; size: "sm" | "md" }) {
  const box = size === "md" ? "h-10 w-10" : "h-9 w-9";
  return (
    <div className={`relative ${box} rounded-full overflow-hidden bg-brand-blue-soft border border-line shrink-0 flex items-center justify-center text-xs font-bold text-brand-blue`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export function MessagesTab({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  orders,
  initialContext,
  onContextConsumed,
}: Props) {
  const t = useTranslations();
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextOrderId, setContextOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Phones show the list or the open chat, never both; arriving with context opens the chat directly
  const [mobileThreadOpen, setMobileThreadOpen] = useState(Boolean(initialContext));
  useEffect(() => {
    if (initialContext) setMobileThreadOpen(true);
  }, [initialContext]);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      onSelectConversation(conversations[0].id);
    }
  }, [activeConversationId, conversations, onSelectConversation]);

  const selectedId = activeConversationId || conversations[0]?.id || "";
  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];
  const upload = useChatAttachment(activeConv?.id);
  const buyerOrders = activeConv ? orders.filter((o) => o.buyer.id === activeConv.buyerId) : [];

  // Switching buyer resets the composer; arriving from the Orders tab pre-selects that order
  const clearUpload = upload.clear;
  useEffect(() => {
    clearUpload();
    setSendError(null);
    if (initialContext && initialContext.conversationId === activeConv?.id) {
      setContextOrderId(initialContext.orderId ?? "");
      if (initialContext.draft) setInputText(initialContext.draft);
      onContextConsumed?.();
    } else {
      setContextOrderId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on conversation change only
  }, [activeConv?.id, clearUpload]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function send(text: string, withComposerState: boolean) {
    if (!activeConv || sending) return;
    const attachment = withComposerState ? upload.attachment ?? undefined : undefined;
    if (!text.trim() && !attachment) return;
    setSending(true);
    setSendError(null);
    try {
      await onSendMessage(activeConv.id, text, attachment, contextOrderId || undefined);
      if (withComposerState) {
        setInputText("");
        upload.clear();
      }
    } catch (err) {
      setSendError(err instanceof Error ? t("chat.notSent", { message: err.message }) : t("chat.messageNotSentPleaseRetry"));
    } finally {
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    void send(inputText.trim(), true);
  }

  const canSend = (inputText.trim().length > 0 || upload.attachment !== null) && !upload.uploading && !sending;

  return (
    <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-140px)] min-h-[460px] md:h-[750px]">
      {/* Left Pane: Conversation List */}
      <div className={`${mobileThreadOpen ? "hidden md:flex" : "flex"} w-full md:w-80 min-h-0 flex-1 md:flex-none border-r border-line flex-col shrink-0 bg-canvas/60`}>
        {/* Search header */}
        <div className="p-3.5 border-b border-line bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-neutral-900">{t("seller.nav.tradeMessenger")}</h2>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
              {conversations.length} {conversations.length === 1 ? t("seller.messages.buyer") : t("seller.messages.buyers")}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("seller.messages.searchConversations")}
              className="w-full rounded-xl border border-line bg-canvas pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-hidden"
            />
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-line">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConv?.id;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  onSelectConversation(conv.id);
                  setMobileThreadOpen(true);
                }}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                  isSelected ? "bg-white border-l-4 border-l-brand-blue shadow-2xs" : "hover:bg-neutral-200/50"
                }`}
              >
                <div className="relative">
                  <Avatar url={conv.buyerAvatarUrl} name={conv.buyerName} size="md" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-neutral-900 truncate">{conv.buyerCompany}</p>
                    <span className="text-[10px] text-neutral-400 shrink-0">{formatChatTime(conv.lastMessageTime)}</span>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">
                    {[conv.buyerName, conv.buyerCountry].filter(Boolean).join(" • ")}
                  </p>
                  <p className="text-xs text-neutral-700 truncate mt-0.5 font-medium">{conv.lastMessage}</p>
                  {conv.relatedProduct && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-brand-blue bg-blue-50 px-1.5 py-0.2 rounded-md truncate max-w-full">
                      {conv.relatedProduct}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filteredConversations.length === 0 && (
            <p className="p-6 text-center text-xs text-ink-muted">
              {t("seller.messages.noConversationsYetUse")} <strong>{t("seller.chatWithBuyer")}</strong> {t("seller.messages.onAnOrderRequestTo")}
            </p>
          )}
        </div>
      </div>

      {/* Right Pane: Chat Thread */}
      {activeConv ? (
        <div className={`${mobileThreadOpen ? "flex" : "hidden md:flex"} flex-1 min-h-0 flex-col bg-white min-w-0`}>
          {/* Top Chat Header */}
          <div className="p-3.5 border-b border-line flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileThreadOpen(false)}
                className="md:hidden -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-canvas"
                aria-label={t("seller.messages.backToConversations")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar url={activeConv.buyerAvatarUrl} name={activeConv.buyerName} size="sm" />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <span className="truncate">{activeConv.buyerCompany}</span>
                  {activeConv.buyerCountry && (
                    <span className="rounded-md bg-canvas px-1.5 py-0.2 text-[10px] font-semibold text-neutral-600">
                      {activeConv.buyerCountry}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-ink-muted">{t("seller.messages.contactPerson")} {activeConv.buyerName}</p>
              </div>
            </div>

            {activeConv.relatedProduct && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-700 bg-canvas px-2.5 py-1 rounded-xl border border-line">
                <Package className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                <span className="truncate max-w-[200px] font-medium">{activeConv.relatedProduct}</span>
              </div>
            )}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
            {activeConv.messages.length === 0 && (
              <div className="mx-auto mt-10 max-w-sm text-center text-neutral-500">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-700">{t("seller.messages.noMessagesYet")}</p>
                <p className="mt-1 text-xs">
                  {buyerOrders.length > 0
                    ? t("seller.messages.pickTheOrderYouAre")
                    : t("seller.messages.sendAMessageToStart")}
                </p>
              </div>
            )}
            {activeConv.messages.map((msg) => {
              const isSeller = msg.sender === "seller";
              return (
                <div key={msg.id} className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                      isSeller
                        ? "bg-brand-blue text-white rounded-br-xs"
                        : "bg-white text-neutral-900 border border-line rounded-bl-xs"
                    }`}
                  >
                    {msg.order && <MessageOrderTag order={msg.order} tone={isSeller ? "own" : "other"} />}
                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                    {msg.attachment && <MessageAttachmentView attachment={msg.attachment} tone={isSeller ? "own" : "other"} />}

                    {/* Legacy quote summary card */}
                    {msg.attachmentData && (
                      <div
                        className={`mt-2.5 p-2.5 rounded-xl border text-xs ${
                          isSeller
                            ? "bg-brand-blue-dark border-blue-400/30 text-white"
                            : "bg-blue-50 border-blue-200 text-blue-950"
                        }`}
                      >
                        <p className="font-bold flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{msg.attachmentData.title}</span>
                        </p>
                        <p className="text-[11px] opacity-85 mt-0.5">{msg.attachmentData.detail}</p>
                        {msg.attachmentData.price && (
                          <p className="font-extrabold text-amber-300 mt-1">
                            {t("seller.messages.quoted")}{(msg.attachmentData.price ?? 0).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">{formatChatTime(msg.timestamp)}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Smart Replies */}
          <div className="px-4 py-2 bg-white border-t border-line flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-ink-muted flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3 text-brand-blue" /> {t("seller.messages.quickReplies")}
            </span>
            {[
              t("seller.messages.thankYouForYourOrder"),
              t("seller.messages.yesThisModelIsAvailable"),
              t("seller.messages.iHaveAttachedOurQuotation"),
              t("seller.messages.pleaseShareYourCadDrawing"),
            ].map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void send(qr, false)}
                disabled={sending}
                className="shrink-0 rounded-full border border-line bg-canvas px-2.5 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-200 hover:border-brand-blue transition disabled:opacity-50"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Context: which order this message is about */}
          {buyerOrders.length > 0 && (
            <div className="px-4 py-1.5 bg-white border-t border-line">
              <OrderContextPicker orders={buyerOrders} value={contextOrderId} onChange={setContextOrderId} />
            </div>
          )}

          {(upload.attachment || upload.uploading || upload.error || sendError) && (
            <div
              className={`px-4 py-1.5 border-t flex items-center justify-between text-xs ${
                upload.error || sendError ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50/60 border-blue-100 text-brand-blue"
              }`}
              role={upload.error || sendError ? "alert" : undefined}
            >
              <span className="flex items-center gap-1.5 font-semibold truncate">
                {upload.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Paperclip className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">
                  {upload.error ??
                    sendError ??
                    (upload.uploading ? t("common.uploading") : `Attached: ${upload.attachment?.name} (${upload.attachment?.size})`)}
                </span>
              </span>
              {upload.attachment && !upload.uploading && (
                <button
                  type="button"
                  onClick={upload.clear}
                  className="font-bold text-red-500 hover:underline text-[11px] ml-2 inline-flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" /> {t("common.remove")}
                </button>
              )}
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-line bg-white flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={CHAT_ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                void upload.pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.uploading}
              title={t("chat.attachAnImageOrPdf")}
              aria-label={t("chat.attachAnImageOrPdf")}
              className={`flex items-center justify-center h-9 w-9 rounded-xl border shrink-0 transition disabled:opacity-50 ${
                upload.attachment ? "bg-blue-100 text-brand-blue border-brand-blue" : "bg-canvas text-neutral-500 border-line hover:bg-neutral-200"
              }`}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={inputText}
              maxLength={5000}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("seller.messages.typeYourMessageFobTerms")}
              className="flex-1 min-w-0 rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white shadow-xs transition active:scale-95 shrink-0 disabled:opacity-50"
              title={t("seller.messages.sendMessage")}
              aria-label={t("seller.messages.sendMessage2")}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center p-8 text-neutral-400 text-xs">
          {t("seller.messages.selectAConversationFromThe")}
        </div>
      )}
    </div>
  );
}
