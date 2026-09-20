"use client";

import { useState } from "react";
import {
  Send,
  Search,
  Package,
  FileText,
  Sparkles,
} from "lucide-react";
import type { SellerConversation } from "../types";

type Props = {
  conversations: SellerConversation[];
  activeConversationId?: string;
  onSendMessage: (conversationId: string, text: string) => void;
};

export function MessagesTab({
  conversations,
  activeConversationId,
  onSendMessage,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(
    activeConversationId || conversations[0]?.id || ""
  );
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText("");
  }

  function handleQuickReply(text: string) {
    if (!activeConv) return;
    onSendMessage(activeConv.id, text);
  }

  return (
    <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden flex flex-col md:flex-row h-[750px]">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-80 border-r border-line flex flex-col shrink-0 bg-canvas/60">
        {/* Search header */}
        <div className="p-3.5 border-b border-line bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-neutral-900">Trade Messenger</h2>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
              {conversations.length} Active Buyers
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
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
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                  isSelected ? "bg-white border-l-4 border-l-brand-blue shadow-2xs" : "hover:bg-neutral-200/50"
                }`}
              >
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={conv.buyerAvatarUrl} alt="" className="h-full w-full object-cover" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 truncate">{conv.buyerCompany}</p>
                    <span className="text-[10px] text-neutral-400">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">{conv.buyerName} • {conv.buyerCountry}</p>
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
        </div>
      </div>

      {/* Right Pane: Chat Thread */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Top Chat Header */}
          <div className="p-3.5 border-b border-line flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-canvas border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeConv.buyerAvatarUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <span>{activeConv.buyerCompany}</span>
                  <span className="rounded-md bg-canvas px-1.5 py-0.2 text-[10px] font-semibold text-neutral-600">
                    {activeConv.buyerCountry}
                  </span>
                </h3>
                <p className="text-[11px] text-ink-muted">Contact Person: {activeConv.buyerName} • Verified Buyer</p>
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
            {activeConv.messages.map((msg) => {
              const isSeller = msg.sender === "seller";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                      isSeller
                        ? "bg-brand-blue text-white rounded-br-xs"
                        : "bg-white text-neutral-900 border border-line rounded-bl-xs"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Attachment Preview Card if present */}
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
                            Quoted: ₹{(msg.attachmentData.price ?? 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Smart Replies */}
          <div className="px-4 py-2 bg-white border-t border-line flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-ink-muted flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3 text-brand-blue" /> Quick Replies:
            </span>
            {[
              "Yes, we have ready stock in Pune.",
              "I have attached our technical test report.",
              "We provide 2-year on-site commissioning warranty.",
              "Please share your CAD drawing or technical specifications.",
            ].map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReply(qr)}
                className="shrink-0 rounded-full border border-line bg-canvas px-2.5 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-200 hover:border-brand-blue transition"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-line bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message, FOB terms, or technical reply to buyer..."
              className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
            <button
              type="submit"
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white shadow-xs transition active:scale-95 shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 text-xs">
          Select a conversation from the left to start chatting
        </div>
      )}
    </div>
  );
}
