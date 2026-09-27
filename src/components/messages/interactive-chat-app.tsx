"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { ChatMessage, ThreadWithMessages, ChatAttachment } from "./chat-types";
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
    const conversationId = searchParams.get("conversation");
    if (conversationId && initialThreads.some((t) => t.id === conversationId)) return conversationId;
    if (withSlug) {
      const found = initialThreads.find((t) => t.manufacturer.slug === withSlug);
      if (found) return found.id;
    }
    return initialThreads[0]?.id || "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<ChatAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
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

    // Fetch messages for active thread
    getApi()
      .messages.getMessages(selectedThreadId)
      .then((msgs) => {
        if (!isMounted) return;
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === selectedThreadId) {
              // Only real messages; a new conversation starts empty with the quick prompts
              const finalMessages: ChatMessage[] = msgs.map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                time: m.time,
                attachment: m.attachment,
              }));
              return { ...t, messages: finalMessages };
            }
            return t;
          })
        );
      })
      .catch(() => {
        // Fallback gracefully
      });

    // Mark as read in backend
    void getApi().messages.markAsRead(selectedThreadId);

    // Subscribe to SSE stream
    const unsubscribe = getApi().messages.onMessageStream(selectedThreadId, (newMsg) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === selectedThreadId) {
            // Check if message already exists
            if (t.messages.some(m => m.id === newMsg.id)) {
              return t;
            }
            return {
              ...t,
              messages: [...t.messages, {
                id: newMsg.id,
                sender: newMsg.sender,
                text: newMsg.text,
                time: newMsg.time,
                attachment: newMsg.attachment,
              }],
            };
          }
          return t;
        })
      );
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedThreadId]);

  const buyActionHandledRef = useRef(false);

  // Handle direct navigation with ?with=slug parameter
  useEffect(() => {
    if (!withSlug) return;

    const action = searchParams.get("action");
    const productSlug = searchParams.get("product");
    
    // Auto-send Buy Order Request message
    const sendBuyRequest = async (convId: string) => {
      if (action === "buy" && productSlug && !buyActionHandledRef.current) {
        buyActionHandledRef.current = true;
        const text = `🛒 **ORDER REQUEST**\nProduct: ${productSlug.replace(/-/g, " ")}\n\nPlease provide details to proceed with the purchase.`;
        try {
          await getApi().messages.sendMessage(convId, text);
          // Reload messages right after to show it
          const msgs = await getApi().messages.getMessages(convId);
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === convId) {
                return {
                  ...t,
                  messages: msgs.map((m) => ({
                    id: m.id,
                    sender: m.sender,
                    text: m.text,
                    time: m.time,
                    attachment: m.attachment,
                  })),
                };
              }
              return t;
            })
          );
        } catch (e) {
          console.error(e);
        }
      }
    };

    const existing = threads.find((t) => t.manufacturer.slug === withSlug);
    if (existing) {
      setSelectedThreadId(existing.id);
      setMobileShowChat(true);
      void sendBuyRequest(existing.id);
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
          void sendBuyRequest(newConv.id);
        })
        .catch(() => {
          // Handled
        });
    }
  }, [withSlug, allManufacturers, threads, searchParams]);

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
    setChatError(null);

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
              // The live stream may already have delivered the saved message; then drop the placeholder
              messages: t.messages.some((m) => m.id === savedMsg.id)
                ? t.messages.filter((m) => m.id !== tempId)
                : t.messages.map((m) => (m.id === tempId ? {
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
      // Take the unsent message back out and keep the text so the buyer can retry
      setThreads((prev) =>
        prev.map((t) => (t.id === currentThreadId ? { ...t, messages: t.messages.filter((m) => m.id !== tempId) } : t))
      );
      setInputMessage(textToSend);
      setAttachedFile(fileToSend);
      setChatError(err instanceof Error ? err.message : "Message not sent. Please try again.");
    }
  };

  const handleAttachFile = async (file: File) => {
    setUploading(true);
    setChatError(null);
    try {
      const uploaded = await getApi().media.upload(file, file.type.startsWith("image/") ? "image" : "document");
      const size = file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      setAttachedFile({ name: file.name, size, url: uploaded.url });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not upload the file");
    } finally {
      setUploading(false);
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
          onAttachFile={handleAttachFile}
          uploading={uploading}
          error={chatError}
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
