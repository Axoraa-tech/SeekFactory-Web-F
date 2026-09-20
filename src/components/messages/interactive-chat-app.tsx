"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { ChatMessage, ThreadWithMessages } from "./chat-types";
import { ChatThreadList } from "./chat-thread-list";
import { ChatConversationPane } from "./chat-conversation-pane";
import { getApi } from "@/shared/api";

type Props = {
  initialThreads: (Conversation & { manufacturer: Manufacturer })[];
  allManufacturers?: Manufacturer[];
};

export function InteractiveChatApp({ initialThreads, allManufacturers = [] }: Props) {
  const searchParams = useSearchParams();
  const withSlug = searchParams.get("with");

  const [threads, setThreads] = useState<ThreadWithMessages[]>(() => {
    return initialThreads.map((t) => ({
      ...t,
      messages: [],
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isTyping]);

  // Load message history when active thread changes
  useEffect(() => {
    if (!selectedThreadId) return;

    let isMounted = true;
    const currentThread = threads.find((t) => t.id === selectedThreadId);

    // Only fetch if messages haven't been loaded yet
    if (currentThread && currentThread.messages.length === 0) {
      getApi()
        .messages.getMessages(selectedThreadId)
        .then((msgs) => {
          if (!isMounted) return;
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === selectedThreadId) {
                // If backend has no messages yet, provide a friendly manufacturer welcome greeting
                const finalMessages: ChatMessage[] = msgs.length > 0 ? msgs.map((m) => ({
                  id: m.id,
                  sender: m.sender,
                  text: m.text,
                  time: m.time,
                  attachment: m.attachment,
                })) : [
                  {
                    id: `welcome-${t.id}`,
                    sender: "factory",
                    text: `Hello! Welcome to ${t.manufacturer.name}. We specialize in precision engineering and OEM manufacturing. How can we assist your production requirement?`,
                    time: "Just now",
                  },
                ];
                return { ...t, messages: finalMessages };
              }
              return t;
            })
          );
        })
        .catch(() => {
          // Fallback gracefully
        });
    }

    // Mark as read in backend
    void getApi().messages.markAsRead(selectedThreadId);

    return () => {
      isMounted = false;
    };
  }, [selectedThreadId, threads]);

  // Handle direct navigation with ?with=slug parameter
  useEffect(() => {
    if (!withSlug) return;

    const existing = threads.find((t) => t.manufacturer.slug === withSlug);
    if (existing) {
      setSelectedThreadId(existing.id);
      setMobileShowChat(true);
      return;
    }

    // If conversation doesn't exist yet, create it with the manufacturer
    const targetMfg = allManufacturers.find((m) => m.slug === withSlug);
    if (targetMfg) {
      getApi()
        .messages.startConversation(targetMfg.id)
        .then((newConv) => {
          setThreads((prev) => {
            if (prev.some((t) => t.id === newConv.id)) return prev;
            return [{ ...newConv, messages: [] }, ...prev];
          });
          setSelectedThreadId(newConv.id);
          setMobileShowChat(true);
        })
        .catch(() => {
          // Handled
        });
    }
  }, [withSlug, allManufacturers, threads]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    setMobileShowChat(true);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)));
    void getApi().messages.markAsRead(id);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend && !attachedFile) return;

    const currentThreadId = selectedThreadId;
    if (!currentThreadId) return;

    // Optimistic message update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: "user",
      text: textToSend,
      time: "Just now",
      attachment: attachedFile || undefined,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThreadId) {
          return {
            ...t,
            lastMessage: textToSend || `[Sent ${attachedFile?.name}]`,
            lastMessageAt: "Just now",
            messages: [...t.messages, optimisticMsg],
          };
        }
        return t;
      })
    );

    const fileToSend = attachedFile;
    setInputMessage("");
    setAttachedFile(null);

    try {
      // Send real message to backend
      const savedMsg = await getApi().messages.sendMessage(
        currentThreadId,
        textToSend,
        fileToSend || undefined
      );

      // Replace optimistic message with confirmed backend response
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return {
              ...t,
              messages: t.messages.map((m) => (m.id === tempId ? {
                id: savedMsg.id,
                sender: savedMsg.sender,
                text: savedMsg.text,
                time: savedMsg.time,
                attachment: savedMsg.attachment,
              } : m)),
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
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
