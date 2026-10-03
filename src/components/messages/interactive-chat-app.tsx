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
import { useTranslations } from "next-intl";
import { refreshUnreadCounts } from "@/features/inbox/unread-store";

function toChatMessage(m: MessageItem): ChatMessage {
  return { id: m.id, sender: m.sender, text: m.text, time: m.time, attachment: m.attachment, order: m.order };
}

type Props = {
  initialThreads: (Conversation & { manufacturer: Manufacturer })[];
  allManufacturers?: Manufacturer[];
};

export function InteractiveChatApp({ initialThreads, allManufacturers = [] }: Props) {
  const tr = useTranslations();
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
  const selectedThreadRef = useRef(selectedThreadId);
  selectedThreadRef.current = selectedThreadId;
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  // Auto-scroll to the newest message. Only the message list moves: scrollIntoView would also
  // scroll every ancestor (the page, the clipped chat pane), hiding the chat header and Send button.
  useEffect(() => {
    const list = messagesEndRef.current?.parentElement;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
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

    // Opening a chat reads it: clear its count here and, once the backend has it, every badge
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedThreadId && t.unreadCount > 0 ? { ...t, unreadCount: 0 } : t))
    );
    void getApi()
      .messages.markAsRead(selectedThreadId)
      .then(() => refreshUnreadCounts());

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

  // Other chats' unread counts, last messages and who is online change while the inbox is open:
  // re-read the list every 30s (and when the tab regains focus). The open chat stays read.
  useEffect(() => {
    let active = true;
    const refresh = () => {
      getApi()
        .messages.listRecent(50)
        .then((list) => {
          if (!active) return;
          setThreads((prev) => mergeThreads(prev, list, selectedThreadRef.current));
        })
        .catch(() => {});
    };
    const timer = window.setInterval(refresh, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

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
    // Marking read happens in the effect that loads the selected chat
    setSelectedThreadId(id);
    setMobileShowChat(true);
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
      setSendError(err instanceof Error ? tr("chat.notSent", { message: err.message }) : tr("chat.messageNotSentPleaseRetry"));
      if (!customText) setInputMessage(textToSend);
    }
  };

  const quickInquiries = [
    tr("chat.whatIsYourMoqAnd"),
    tr("chat.canYouProvideCifShipping"),
    tr("chat.canWeArrangeALive"),
    tr("chat.pleaseShareIso9001Quality"),
  ];

  const filteredThreads = threads.filter(
    (t) =>
      t.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex h-[calc(100dvh-162px)] min-h-[520px] max-h-[820px]">
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
          {tr("chat.selectAChatToStart")}
        </div>
      )}
    </div>
  );
}

/**
 * Fresh conversation list into the current threads: counts, last message and presence come from
 * the backend; loaded message history stays. The open chat is being read, so it shows no count.
 */
function mergeThreads(
  current: ThreadWithMessages[],
  fresh: (Conversation & { manufacturer: Manufacturer })[],
  openId: string,
): ThreadWithMessages[] {
  const byId = new Map(current.map((t) => [t.id, t]));
  const merged = fresh.map((c) => {
    const existing = byId.get(c.id);
    return {
      ...(existing ?? { messages: [] }),
      ...c,
      // The live stream may be ahead of the list for the open chat
      lastMessage: c.id === openId && existing ? existing.lastMessage : c.lastMessage,
      unreadCount: c.id === openId ? 0 : c.unreadCount,
    };
  });
  // Keep chats the list no longer returns (e.g. just started) at the end
  const freshIds = new Set(fresh.map((c) => c.id));
  return [...merged, ...current.filter((t) => !freshIds.has(t.id))];
}
