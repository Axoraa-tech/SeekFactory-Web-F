"use client";

import Link from "next/link";
import {
  Send,
  Paperclip,
  Building2,
  FileText,
  CheckCheck,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import type { ThreadWithMessages } from "./chat-types";

type Props = {
  activeThread: ThreadWithMessages;
  mobileShowChat: boolean;
  onBackToThreads: () => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  quickInquiries: string[];
  onSendMessage: (e?: React.FormEvent, customText?: string) => void;
  attachedFile: { name: string; size: string } | null;
  onClearAttachment: () => void;
  onAttachMockFile: () => void;
  inputMessage: string;
  onInputChange: (value: string) => void;
};

export function ChatConversationPane({
  activeThread,
  mobileShowChat,
  onBackToThreads,
  isTyping,
  messagesEndRef,
  quickInquiries,
  onSendMessage,
  attachedFile,
  onClearAttachment,
  onAttachMockFile,
  inputMessage,
  onInputChange,
}: Props) {
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
            aria-label="Back to threads"
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
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online Sourcing Engineer
              </span>
              <span>•</span>
              <span>
                {activeThread.manufacturer.location}, {activeThread.manufacturer.country}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/manufacturers/${activeThread.manufacturer.slug}`}
            className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors shadow-2xs"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Visit Plant</span>
          </Link>
          <Link
            href="/rfq/new"
            className="inline-flex items-center gap-1 rounded-xl bg-brand-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Post RFQ</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        <div className="mx-auto max-w-md text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] text-brand-blue font-medium shadow-2xs">
            <Sparkles className="h-3 w-3 text-brand-blue" />
            <span>Verified OEM Direct Channel · Trade Assurance Escrow Protected</span>
          </div>
        </div>

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

              <div className="space-y-1">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                    isUser
                      ? "bg-brand-blue text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                  )}
                >
                  <p>{msg.text}</p>

                  {msg.attachment && (
                    <div
                      className={cn(
                        "mt-2 p-2 rounded-xl flex items-center gap-2 border text-xs",
                        isUser
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      )}
                    >
                      <Paperclip className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <p className="font-bold truncate">{msg.attachment.name}</p>
                        <p className="text-[10px] opacity-80">{msg.attachment.size}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] text-slate-400 px-1 font-medium",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <span>{msg.time}</span>
                  {isUser && <CheckCheck className="h-3 w-3 text-brand-blue" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeThread.manufacturer.logoUrl}
              alt=""
              className="h-6 w-6 rounded-md object-cover"
            />
            <span>{activeThread.manufacturer.name} engineer is typing...</span>
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

      {attachedFile && (
        <div className="px-4 py-1.5 bg-blue-50/60 border-t border-blue-100 flex items-center justify-between text-xs text-brand-blue">
          <span className="flex items-center gap-1.5 font-semibold truncate">
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            <span>
              Attached: {attachedFile.name} ({attachedFile.size})
            </span>
          </span>
          <button
            type="button"
            onClick={onClearAttachment}
            className="font-bold text-red-500 hover:underline text-[11px] ml-2"
          >
            Remove
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => onSendMessage(e)}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={onAttachMockFile}
          title="Attach technical drawing or CAD file"
          className={cn(
            "p-2 rounded-xl border transition-colors shadow-2xs",
            attachedFile
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
          placeholder={`Message ${activeThread.manufacturer.name} technical sales...`}
          className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm outline-none focus:border-brand-blue focus:bg-white transition-colors"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() && !attachedFile}
          className="h-10 px-4 rounded-xl bg-brand-blue text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

