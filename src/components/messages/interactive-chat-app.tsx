"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { ChatMessage, ThreadWithMessages } from "./chat-types";
import { ChatThreadList } from "./chat-thread-list";
import { ChatConversationPane } from "./chat-conversation-pane";

type Props = {
  initialThreads: (Conversation & { manufacturer: Manufacturer })[];
  allManufacturers?: Manufacturer[];
};

export function InteractiveChatApp({ initialThreads }: Props) {
  const searchParams = useSearchParams();
  const withSlug = searchParams.get("with");

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
          text:
            t.lastMessage ||
            "We can start a sample run next week. Standard tooling and batch production takes 15-20 days.",
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
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)));
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
    setAttachedFile({
      name: "RFQ-Technical-Drawing-rev2.dwg",
      size: "2.4 MB",
    });
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
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex h-[calc(100vh-140px)] min-h-[580px] max-h-[820px]">
      <ChatThreadList
        threads={threads}
        filteredThreads={filteredThreads}
        selectedThreadId={selectedThreadId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectThread={handleSelectThread}
        mobileShowChat={mobileShowChat}
      />

      {activeThread ? (
        <ChatConversationPane
          activeThread={activeThread}
          mobileShowChat={mobileShowChat}
          onBackToThreads={() => setMobileShowChat(false)}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          quickInquiries={quickInquiries}
          onSendMessage={handleSendMessage}
          attachedFile={attachedFile}
          onClearAttachment={() => setAttachedFile(null)}
          onAttachMockFile={handleAttachMockFile}
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
