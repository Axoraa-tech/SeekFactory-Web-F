"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { ChatMessage, ThreadWithMessages } from "./chat-types";
import { ChatThreadList } from "./chat-thread-list";
import { ChatConversationPane } from "./chat-conversation-pane";
import { getApi } from "@/shared/api";
import type { MessageItem } from "@/shared/api/contracts";
import type { OrderRequest } from "@/entities/order";
import { useChatAttachment } from "@/hooks/use-chat-attachment";

function toChatMessage(m: MessageItem): ChatMessage {
  return { id: m.id, sender: m.sender, text: m.text, time: m.time, attachment: m.attachment, order: m.order };
}

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
  const [isTyping] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [threadOrders, setThreadOrders] = useState<OrderRequest[]>([]);
  const [contextOrderId, setContextOrderId] = useState("");
  const upload = useChatAttachment(selectedThreadId || undefined);
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
              return { ...t, messages: msgs.map(toChatMessage) };
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
            // Our own message can arrive over the stream before the send request returns:
            // swap it in for the pending optimistic copy instead of showing it twice.
            const pendingIdx = t.messages.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.sender === newMsg.sender &&
                m.text === newMsg.text &&
                (m.attachment?.url ?? "") === (newMsg.attachment?.url ?? "")
            );
            const messages =
              pendingIdx >= 0
                ? t.messages.map((m, i) => (i === pendingIdx ? toChatMessage(newMsg) : m))
                : [...t.messages, toChatMessage(newMsg)];
            return {
              ...t,
              lastMessage: newMsg.text || newMsg.attachment?.name || t.lastMessage,
              messages,
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

  // Orders with this factory, for tagging a message with its order
  const clearUpload = upload.clear;
  useEffect(() => {
    setContextOrderId("");
    setThreadOrders([]);
    setSendError(null);
    clearUpload(); // an upload belongs to one conversation only
    if (!selectedThreadId) return;
    let active = true;
    getApi()
      .messages.listConversationOrders(selectedThreadId)
      .then((orders) => {
        if (active) setThreadOrders(orders);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedThreadId, clearUpload]);

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
                  messages: msgs.map(toChatMessage),
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
    const textToSend = (customText ?? inputMessage).trim();
    const fileToSend = customText ? null : upload.attachment;
    if ((!textToSend && !fileToSend) || upload.uploading) return;

    const currentThreadId = selectedThreadId;
    if (!currentThreadId) return;
    const orderId = contextOrderId || undefined;
    const order = threadOrders.find((o) => o.id === orderId);

    // Optimistic message update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: "user",
      text: textToSend,
      time: new Date().toISOString(),
      attachment: fileToSend ?? undefined,
      order: order && {
        id: order.id,
        referenceNumber: order.referenceNumber,
        productName: order.productName,
        quantity: order.quantity,
        unit: order.unit,
        status: order.status,
      },
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId
          ? {
              ...t,
              lastMessage: textToSend || `📎 ${fileToSend?.name}`,
              lastMessageAt: new Date().toISOString(),
              messages: [...t.messages, optimisticMsg],
            }
          : t
      )
    );
    setSendError(null);
    if (!customText) {
      setInputMessage("");
      upload.clear();
    }

    try {
      const savedMsg = await getApi().messages.sendMessage(currentThreadId, textToSend, fileToSend ?? undefined, { orderId });
      setThreads((prev) =>
        prev.map((t) =>
          t.id === currentThreadId
            ? {
                ...t,
                // The live stream may already have delivered it; keep one copy
                messages: t.messages.some((m) => m.id === savedMsg.id)
                  ? t.messages.filter((m) => m.id !== tempId)
                  : t.messages.map((m) => (m.id === tempId ? toChatMessage(savedMsg) : m)),
              }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setThreads((prev) =>
        prev.map((t) => (t.id === currentThreadId ? { ...t, messages: t.messages.filter((m) => m.id !== tempId) } : t))
      );
      setSendError(err instanceof Error ? `Not sent: ${err.message}` : "Message not sent. Please retry.");
      if (!customText) setInputMessage(textToSend);
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
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          attachment={upload.attachment}
          attachmentUploading={upload.uploading}
          attachmentError={upload.error}
          onPickFile={upload.pick}
          onClearAttachment={upload.clear}
          orders={threadOrders}
          contextOrderId={contextOrderId}
          onContextChange={setContextOrderId}
          sendError={sendError}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
