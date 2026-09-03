"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
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
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";

type ChatMessage = {
  id: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: {
    name: string;
    size: string;
  };
};

type ThreadWithMessages = Conversation & {
  manufacturer: Manufacturer;
  messages: ChatMessage[];
};

type Props = {
  initialThreads: (Conversation & { manufacturer: Manufacturer })[];
  allManufacturers?: Manufacturer[];
};

export function InteractiveChatApp({ initialThreads }: Props) {
  const searchParams = useSearchParams();
  const withSlug = searchParams.get("with");

  // Build full threads with rich initial messages
  const [threads, setThreads] = useState<ThreadWithMessages[]>(() => {
    return initialThreads.map((t) => ({
      ...t,
      messages: [
        {
          id: `m-init-1-${t.id}`,
          sender: "factory",
          text: `Hello! Welcome to ${t.manufacturer.name}. We specialize in precision manufacturing and custom OEM components. How can our engineering team assist you today?`,
          time: "10:30 AM",
        },
        {
          id: `m-init-2-${t.id}`,
          sender: "user",
          text: "Hi, I am looking to source industrial batch components with ±0.01mm tolerance. What is your standard production lead time?",
          time: "10:32 AM",
        },
        {
          id: `m-init-3-${t.id}`,
          sender: "factory",
          text: t.lastMessage || "We can start a sample run next week. Standard tooling and batch production takes 15-20 days.",
          time: t.lastMessageAt || "10:35 AM",
        },
      ],
    }));
  });

  const [selectedThreadId, setSelectedThreadId] = useState<string>(() => {
    if (withSlug) {
      const found = initialThreads.find((t) => t.manufacturer.slug === withSlug);
      if (found) return found.id;
    }
    return initialThreads[0]?.id || "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(withSlug));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isTyping]);

  // Handle URL withSlug changes
  useEffect(() => {
    if (withSlug) {
      const found = threads.find((t) => t.manufacturer.slug === withSlug);
      if (found) {
        setSelectedThreadId(found.id);
        setMobileShowChat(true);
      }
    }
  }, [withSlug, threads]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    setMobileShowChat(true);
    // Mark as read
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend && !attachedFile) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: "Just now",
      attachment: attachedFile || undefined,
    };

    const currentThreadId = selectedThreadId;

    // Update local messages & thread last message
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThreadId) {
          return {
            ...t,
            lastMessage: textToSend || `[Sent ${attachedFile?.name}]`,
            lastMessageAt: "Just now",
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setInputMessage("");
    setAttachedFile(null);

    // Simulate factory response after 1.2 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const factoryReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: "factory",
        text: `Thank you for the inquiry! Our technical sales engineer at ${activeThread?.manufacturer.name || "the plant"} has received this. We can provide a detailed quotation and DFM analysis for this requirement right away.`,
        time: "Just now",
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return {
              ...t,
              lastMessage: factoryReply.text,
              lastMessageAt: "Just now",
              messages: [...t.messages, factoryReply],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const handleAttachMockFile = () => {
    if (attachedFile) {
      setAttachedFile(null);
    } else {
      setAttachedFile({
        name: "Component_CAD_Drawing_v2.dwg",
        size: "4.2 MB",
      });
    }
  };

  const quickInquiries = [
    "📋 What is your MOQ and pricing for 500 units?",
    "🚢 Can you provide CIF shipping rates?",
    "📹 Can we arrange a live video tour of the CNC line?",
    "📄 Please share ISO 9001 quality certificates.",
  ];

  const filteredThreads = threads.filter(
    (t) =>
      t.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex h-[calc(100vh-140px)] min-h-[580px] max-h-[820px]">
      {/* 1. LEFT PANE: THREADS LIST (Hidden on mobile if chat is active) */}
      <div
        className={cn(
          "w-full md:w-[320px] lg:w-[360px] border-r border-slate-100 flex flex-col bg-slate-50/40 shrink-0",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header & Search */}
        <div className="p-3.5 border-b border-slate-100 bg-white space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Messages & Chats</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-brand-blue">
                {threads.length}
              </span>
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manufacturers & chats..."
              className="w-full h-8 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-brand-blue focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 p-1 space-y-0.5">
          {filteredThreads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => handleSelectThread(thread.id)}
                className={cn(
                  "w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all",
                  isSelected
                    ? "bg-white shadow-xs border border-slate-200/80 ring-1 ring-brand-blue/20"
                    : "hover:bg-slate-100/70"
                )}
              >
                {/* Avatar with live online badge */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thread.manufacturer.logoUrl}
                    alt={thread.manufacturer.name}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {thread.manufacturer.name}
                      </p>
                      {thread.manufacturer.verified && <VerifiedBadge className="h-3 w-3 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {thread.lastMessageAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                    {thread.lastMessage}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <span>{thread.manufacturer.country}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Replies &lt; 2h</span>
                  </div>
                </div>

                {thread.unreadCount > 0 && (
                  <span className="h-4 min-w-4 px-1 rounded-full bg-brand-blue text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-1">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT PANE: ACTIVE CHAT CONVERSATION */}
      {activeThread ? (
        <div
          className={cn(
            "flex-1 flex flex-col bg-white overflow-hidden",
            !mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          {/* Chat Header */}
          <div className="p-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Back to threads"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeThread.manufacturer.logoUrl}
                alt={activeThread.manufacturer.name}
                className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {activeThread.manufacturer.name}
                  </h3>
                  {activeThread.manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online Sourcing Engineer
                  </span>
                  <span>•</span>
                  <span>{activeThread.manufacturer.location}, {activeThread.manufacturer.country}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
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

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {/* Sourcing Security Assurance Pill */}
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
                    <img
                      src={activeThread.manufacturer.logoUrl}
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

                      {/* Mock Attached File Card */}
                      {msg.attachment && (
                        <div
                          className={cn(
                            "mt-2 p-2 rounded-xl flex items-center gap-2 border text-xs",
                            isUser ? "bg-white/10 border-white/20 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
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

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeThread.manufacturer.logoUrl}
                  alt=""
                  className="h-6 w-6 rounded-md object-cover"
                />
                <span>{activeThread.manufacturer.name} engineer is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Templates */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickInquiries.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(undefined, template)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue transition-colors shadow-2xs whitespace-nowrap"
              >
                {template}
              </button>
            ))}
          </div>

          {/* Attachment Preview (if attached) */}
          {attachedFile && (
            <div className="px-4 py-1.5 bg-blue-50/60 border-t border-blue-100 flex items-center justify-between text-xs text-brand-blue">
              <span className="flex items-center gap-1.5 font-semibold truncate">
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span>Attached: {attachedFile.name} ({attachedFile.size})</span>
              </span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="font-bold text-red-500 hover:underline text-[11px] ml-2"
              >
                Remove
              </button>
            </div>
          )}

          {/* Message Composer Form */}
          <form
            onSubmit={(e) => handleSendMessage(e)}
            className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={handleAttachMockFile}
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
              onChange={(e) => setInputMessage(e.target.value)}
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
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
