"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { getApi } from "@/shared/api";
import type { FactoryQuote, FactorySeekUpdate, NewFactoryProduct, NewFactorySeek } from "@/shared/api/contracts";
import type { BuyerProfile } from "@/entities/user";
import type {
  SellerChatMessage,
  SellerConversation,
  SellerFactoryProfile,
  SellerProduct,
  SellerRfq,
  SellerSeek,
  SellerStats,
  SellerTab,
} from "./types";
import { parseSellerTab } from "./types";
import {
  createProductAction,
  createSeekAction,
  deleteProductAction,
  deleteSeekAction,
  setProductListedAction,
  setSeekListedAction,
  submitQuoteAction,
  updateProductAction,
  updateSeekAction,
  updateOrderStatusAction,
  updateFactoryProfileAction,
} from "./actions";
import {
  toManufacturerUpdate,
  toSellerProduct,
  toSellerProfile,
  toSellerRfq,
  toSellerSeek,
} from "./mappers";

import { SalesproSidebar } from "./components/salespro-sidebar";
import { SalesproTopbar } from "./components/salespro-topbar";
import { SalesproOverviewView } from "./components/salespro-overview-view";
import { ProductsTab } from "./tabs/products-tab";
import { SeeksTab } from "./tabs/seeks-tab";
import { RfqsTab } from "./tabs/rfqs-tab";
import { MessagesTab } from "./tabs/messages-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { OrdersTab } from "./tabs/orders-tab";
import { AddProductModal } from "./components/add-product-modal";
import { AddSeekModal } from "./components/add-seek-modal";
import { EditSeekModal } from "./components/edit-seek-modal";
import { RfqQuoteModal } from "./components/rfq-quote-modal";
import { FactoryPricingModal, type FactoryPlanTier } from "./components/factory-pricing-modal";
import { AccountSecurityCard } from "@/features/auth/account-security-card";
import Link from "next/link";
import type { FactoryVerification } from "@/shared/api/contracts";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import type { RfqItem } from "@/entities/rfq";
import type { OrderRequest, OrderStatus } from "@/entities/order";
import type { MessageAttachment, MessageItem } from "@/shared/api/contracts";

function toSellerMessage(m: MessageItem): SellerChatMessage {
  return {
    id: m.id,
    sender: m.sender === "factory" ? "seller" : "buyer",
    text: m.text,
    timestamp: m.time,
    attachment: m.attachment,
    order: m.order,
  };
}
import type { Category } from "@/entities/category";

type Props = {
  user: BuyerProfile;
  initialProfile?: Manufacturer | null;
  initialStats?: SellerStats | null;
  initialProducts?: Product[];
  initialSeeks?: Reel[];
  initialRfqs?: RfqItem[];
  initialOrders?: OrderRequest[];
  initialConversations?: SellerConversation[];
  allCategories?: Category[];
  verification?: FactoryVerification | null;
};

// Stable defaults: fresh `[]` literals would retrigger the prop-sync effects every render.
const NO_PRODUCTS: Product[] = [];
const NO_SEEKS: Reel[] = [];
const NO_RFQS: RfqItem[] = [];
const NO_ORDERS: OrderRequest[] = [];
const NO_CONVERSATIONS: SellerConversation[] = [];
const NO_CATEGORIES: Category[] = [];

const EMPTY_STATS: SellerStats = {
  totalProductViews: 0,
  productViewsChange: null,
  factoryProfileVisits: 0,
  profileVisitsChange: null,
  videoSeekPlays: 0,
  videoPlaysChange: null,
  activeRfqsCount: 0,
  pendingRfqsCount: 0,
  responseRatePercent: null,
  avgResponseTimeHours: null,
  followerCount: 0,
  totalProductsCount: 0,
  totalSeeksCount: 0,
};

export function FactoryDashboard({
  user,
  initialProfile,
  initialStats,
  initialProducts = NO_PRODUCTS,
  initialSeeks = NO_SEEKS,
  initialRfqs = NO_RFQS,
  initialOrders = NO_ORDERS,
  initialConversations = NO_CONVERSATIONS,
  allCategories = NO_CATEGORIES,
  verification,
}: Props) {
  // The open tab lives in the URL (/factory?tab=orders) so a reload or a shared link reopens it,
  // and browser back/forward moves between tabs. pushState keeps it client-side (no refetch).
  const searchParams = useSearchParams();
  const activeTab = parseSellerTab(searchParams.get("tab"));
  const setActiveTab = useCallback((tab: SellerTab) => {
    const params = new URLSearchParams(window.location.search);
    if (tab === "overview") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    window.history.pushState(null, "", query ? `/factory?${query}` : "/factory");
  }, []);
  const [stats, setStats] = useState<SellerStats>(initialStats ?? EMPTY_STATS);
  const [products, setProducts] = useState<SellerProduct[]>(() =>
    initialProducts.map((p) => toSellerProduct(p, allCategories))
  );
  const [seeks, setSeeks] = useState<SellerSeek[]>(() =>
    initialSeeks.map((s) => toSellerSeek(s, allCategories, initialProducts))
  );
  const [rfqs, setRfqs] = useState<SellerRfq[]>(() => initialRfqs.map((r) => toSellerRfq(r, allCategories)));
  const [orders, setOrders] = useState<OrderRequest[]>(initialOrders);
  const [conversations, setConversations] = useState<SellerConversation[]>(initialConversations);
  const [profile, setProfile] = useState<SellerFactoryProfile>(() => toSellerProfile(initialProfile, user));
  // Surfaces failures from actions that have no modal of their own (e.g. deletes).
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSeekOpen, setIsAddSeekOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editingSeek, setEditingSeek] = useState<SellerSeek | null>(null);
  const [quotingRfq, setQuotingRfq] = useState<SellerRfq | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Server actions revalidate /factory, which re-renders with fresh props: adopt them.
  useEffect(() => {
    setProducts(initialProducts.map((p) => toSellerProduct(p, allCategories)));
  }, [initialProducts, allCategories]);

  useEffect(() => {
    setSeeks(initialSeeks.map((s) => toSellerSeek(s, allCategories, initialProducts)));
  }, [initialSeeks, allCategories, initialProducts]);

  useEffect(() => {
    setRfqs(initialRfqs.map((r) => toSellerRfq(r, allCategories)));
  }, [initialRfqs, allCategories]);

  useEffect(() => {
    // Plan tier is local-only until billing exists, so keep it across refreshes.
    setProfile((prev) => toSellerProfile(initialProfile, user, prev.tier));
  }, [initialProfile, user]);

  useEffect(() => {
    if (initialStats) setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  function handleSelectFactoryPlan(tierId: FactoryPlanTier, tierName: string) {
    setProfile((prev) => ({
      ...prev,
      tier: tierName,
    }));
    setIsPricingModalOpen(false);
  }

  // Unread messages count
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const newRfqsCount = rfqs.filter((r) => r.status === "New").length;
  const newOrdersCount = orders.filter((o) => o.status === "PENDING").length;

  // Handlers — add/quote/profile throw on failure so the calling modal or form can show the error.
  async function handleAddProduct(input: NewFactoryProduct) {
    const result = await createProductAction(input);
    if (!result.ok) throw new Error(result.error);
    const created = toSellerProduct(result.data, allCategories);
    setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    setStats((prev) => ({ ...prev, totalProductsCount: prev.totalProductsCount + 1 }));
  }

  async function handleUpdateProduct(id: string, input: NewFactoryProduct) {
    const { imageUrl: _cover, ...update } = input;
    void _cover; // the cover is imageUrls[0]
    const result = await updateProductAction(id, update);
    if (!result.ok) throw new Error(result.error);
    const updated = toSellerProduct(result.data, allCategories);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  /** Pause/relist; failures show in the notice bar. */
  async function handleSetProductListed(id: string, listed: boolean) {
    const result = await setProductListedAction(id, listed);
    if (!result.ok) {
      setNotice(`Could not ${listed ? "relist" : "pause"} product: ${result.error}`);
      return;
    }
    const updated = toSellerProduct(result.data, allCategories);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDeleteProduct(id: string) {
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const result = await deleteProductAction(id);
    if (!result.ok) {
      setProducts(previous);
      setNotice(`Could not delete product: ${result.error}`);
      return;
    }
    setStats((prev) => ({ ...prev, totalProductsCount: Math.max(0, prev.totalProductsCount - 1) }));
  }

  async function handleAddSeek(input: NewFactorySeek) {
    const result = await createSeekAction(input);
    if (!result.ok) throw new Error(result.error);
    const created = toSellerSeek(result.data, allCategories, initialProducts);
    setSeeks((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
    setStats((prev) => ({ ...prev, totalSeeksCount: prev.totalSeeksCount + 1 }));
  }

  async function handleUpdateSeek(id: string, input: FactorySeekUpdate) {
    const result = await updateSeekAction(id, input);
    if (!result.ok) throw new Error(result.error);
    const previous = seeks.find((s) => s.id === id);
    const updated = toSellerSeek(result.data, allCategories, initialProducts);
    // The seek API does not echo the upload-time category; keep the one we showed
    setSeeks((prev) => prev.map((s) => (s.id === id ? { ...updated, category: previous?.category ?? updated.category } : s)));
  }

  async function handleSetSeekListed(id: string, listed: boolean) {
    const result = await setSeekListedAction(id, listed);
    if (!result.ok) {
      setNotice(`Could not ${listed ? "relist" : "pause"} video: ${result.error}`);
      return;
    }
    setSeeks((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: listed ? (s.videoUrl ? "Published" : "Processing") : "Paused" } : s,
      ),
    );
  }

  async function handleDeleteSeek(id: string) {
    const previous = seeks;
    setSeeks((prev) => prev.filter((s) => s.id !== id));
    const result = await deleteSeekAction(id);
    if (!result.ok) {
      setSeeks(previous);
      setNotice(`Could not delete video seek: ${result.error}`);
      return;
    }
    setStats((prev) => ({ ...prev, totalSeeksCount: Math.max(0, prev.totalSeeksCount - 1) }));
  }

  async function handleUpdateProfile(updated: Partial<SellerFactoryProfile>) {
    const result = await updateFactoryProfileAction(toManufacturerUpdate(updated));
    if (!result.ok) throw new Error(result.error);
    setProfile((prev) => toSellerProfile(result.data, user, prev.tier));
  }

  async function handleUpdateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const result = await updateOrderStatusAction(orderId, status, note);
    if (!result.ok) throw new Error(result.error);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? result.data : o)));
  }

  async function handleSubmitQuote(rfqId: string, quote: FactoryQuote) {
    const result = await submitQuoteAction(rfqId, quote);
    if (!result.ok) throw new Error(result.error);

    // The buyer is notified by the backend (QUOTE notification); the quote is not a chat message.
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId
          ? {
              ...r,
              status: "Quoted",
              quotedPriceInr: quote.quotePrice,
              leadTimeDays: quote.leadTimeDays,
              quoteIncoterm: quote.incoterm,
              quoteNotes: quote.notes,
            }
          : r
      )
    );
  }

  /** Sends a chat message; rejects with a user-facing message if it could not be delivered. */
  async function handleSendMessage(
    conversationId: string,
    text: string,
    attachment?: MessageAttachment,
    orderId?: string,
  ) {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    const order = orders.find((o) => o.id === orderId);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimistic: SellerChatMessage = {
      id: tempId,
      sender: "seller",
      text: trimmed,
      timestamp: new Date().toISOString(),
      attachment,
      order: order && {
        id: order.id,
        referenceNumber: order.referenceNumber,
        productName: order.productName,
        productSlug: order.productSlug,
        quantity: order.quantity,
        unit: order.unit,
        status: order.status,
      },
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: trimmed || `📎 ${attachment?.name}`,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              messages: [...c.messages, optimistic],
            }
          : c
      )
    );

    try {
      const saved = await getApi().messages.sendMessage(conversationId, trimmed, attachment, { orderId });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                // The live stream may already have delivered the saved message; keep one copy
                messages: c.messages.some((m) => m.id === saved.id)
                  ? c.messages.filter((m) => m.id !== tempId)
                  : c.messages.map((m) => (m.id === tempId ? toSellerMessage(saved) : m)),
              }
            : c
        )
      );
    } catch (err) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, messages: c.messages.filter((m) => m.id !== tempId) } : c))
      );
      throw new Error(err instanceof Error ? err.message : "Message not sent. Please retry.");
    }
  }

  /** Orders tab → chat: opens (or creates) the conversation with that order's buyer. */
  const [pendingContext, setPendingContext] = useState<
    { conversationId: string; orderId?: string; draft?: string } | null
  >(null);
  async function openChatForOrder(order: OrderRequest) {
    const conv = await getApi().factory.openOrderConversation(order.id);
    setConversations((prev) =>
      prev.some((c) => c.id === conv.id)
        ? prev
        : [
            {
              id: conv.id,
              buyerId: conv.buyerId || order.buyer.id,
              buyerName: conv.buyerName || order.buyer.name,
              buyerCompany: conv.buyerCompany || order.buyer.companyName || order.buyer.name,
              buyerCountry: order.buyer.country || "",
              buyerAvatarUrl: conv.buyerAvatarUrl || order.buyer.avatarUrl || "",
              lastMessage: conv.lastMessage || "",
              lastMessageTime: conv.lastMessageAt || "",
              unreadCount: 0,
              relatedProduct: order.productName,
              status: "active",
              messages: [],
            },
            ...prev,
          ]
    );
    setPendingContext({ conversationId: conv.id, orderId: order.id });
    setActiveConversationId(conv.id);
    setActiveTab("messages");
  }

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch real messages when opening a conversation
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    
    // Fetch initial messages unconditionally to always get latest when switching
    getApi()
      .messages.getMessages(activeConversationId)
      .then((msgs) => {
        if (!isMounted) return;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConversationId) {
              return {
                ...c,
                messages: msgs.map(toSellerMessage),
                unreadCount: 0,
              };
            }
            return c;
          })
        );
      })
      .catch(console.error);
    
    // Also mark as read on backend
    void getApi().messages.markAsRead(activeConversationId);

    // Subscribe to SSE stream
    const unsubscribe = getApi().messages.onMessageStream(activeConversationId, (newMsg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            if (c.messages.some(m => m.id === newMsg.id)) {
              return c;
            }
            // Our own message can arrive over the stream before the send request returns:
            // swap it in for the pending optimistic copy instead of showing it twice.
            const incoming = toSellerMessage(newMsg);
            const pendingIdx = c.messages.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.sender === incoming.sender &&
                m.text === incoming.text &&
                (m.attachment?.url ?? "") === (incoming.attachment?.url ?? "")
            );
            return {
              ...c,
              lastMessage: newMsg.text || (newMsg.attachment ? `📎 ${newMsg.attachment.name}` : c.lastMessage),
              lastMessageTime: newMsg.time,
              messages:
                pendingIdx >= 0
                  ? c.messages.map((m, i) => (i === pendingIdx ? incoming : m))
                  : [...c.messages, incoming],
            };
          }
          return c;
        })
      );
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeConversationId]); // Only re-run when active thread changes

  /** RFQs tab → chat: opens (or creates) the conversation with the buyer who posted the RFQ. */
  async function openChatForRfq(rfq: SellerRfq) {
    const conv = await getApi().factory.openRfqConversation(rfq.id);
    setConversations((prev) =>
      prev.some((c) => c.id === conv.id)
        ? prev
        : [
            {
              id: conv.id,
              buyerId: conv.buyerId || "",
              buyerName: conv.buyerName || rfq.buyerName,
              buyerCompany: conv.buyerCompany || rfq.buyerCompany,
              buyerCountry: rfq.buyerCountry,
              buyerAvatarUrl: conv.buyerAvatarUrl || rfq.buyerAvatarUrl || "",
              lastMessage: conv.lastMessage || "",
              lastMessageTime: conv.lastMessageAt || "",
              unreadCount: 0,
              relatedProduct: rfq.productName,
              status: "active",
              messages: [],
            },
            ...prev,
          ]
    );
    setPendingContext({
      conversationId: conv.id,
      draft: `Regarding your RFQ ${rfq.referenceNumber} (${rfq.productName}): `,
    });
    setActiveConversationId(conv.id);
    setActiveTab("messages");
  }

  return (
    <div className="sf-hub min-h-screen bg-[#F8FAFC] flex">
      {/* Salespro Left Sidebar (Responsive drawer on mobile) */}
      <SalesproSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        productsCount={products.length}
        seeksCount={seeks.length}
        rfqsCount={newRfqsCount}
        ordersCount={newOrdersCount}
        unreadMessagesCount={unreadMessagesCount}
        profile={profile}
        userName={user.name}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenUpgradeModal={() => setIsPricingModalOpen(true)}
        verificationStatus={verification?.status}
        verificationSubmitted={verification?.submitted}
      />

      {/* Main Content Area (offset by fixed 256px / w-64 sidebar on desktop) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {/* Top Header with title, hamburger menu, & action buttons */}
          <SalesproTopbar
            activeTab={activeTab}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onOpenAddSeek={() => setIsAddSeekOpen(true)}
            profile={profile}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          {notice && (
            <div
              role="alert"
              className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss"
                className="shrink-0 rounded p-0.5 hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {verification && verification.status !== "APPROVED" && (
            <div
              className={`mt-4 flex flex-col gap-2 rounded-xl border px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between ${
                verification.status === "REJECTED"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <span className="font-semibold">
                {verification.status === "REJECTED"
                  ? `Verification declined${verification.rejectionReason ? `: ${verification.rejectionReason}` : ""}. Your factory is hidden from buyers until it is approved.`
                  : verification.submitted
                    ? "Verification is in review. Your products and seeks become visible to buyers once SeekFactory approves your factory."
                    : "Your factory is not verified yet, so buyers cannot see your products or seeks. Submit your business details to get approved."}
              </span>
              {(verification.status === "REJECTED" || !verification.submitted) && (
                <Link
                  href="/factory/verify"
                  className="shrink-0 rounded-lg bg-brand-blue px-3 py-1.5 text-center font-bold text-white hover:bg-brand-blue-dark"
                >
                  {verification.status === "REJECTED" ? "Resubmit details" : "Verify factory"}
                </Link>
              )}
            </div>
          )}

          {/* Tab Views (keyed so each switch replays the enter transition) */}
          <div key={activeTab} className="sf-enter">
          {activeTab === "overview" && (
            <SalesproOverviewView
              profile={profile}
              stats={stats}
              products={products}
              seeks={seeks}
              rfqs={rfqs}
              onOpenQuoteModal={(rfq) => setQuotingRfq(rfq)}
              onViewAllRfqs={() => setActiveTab("rfqs")}
            />
          )}

          {activeTab === "products" && (
            <div className="pt-5">
              <ProductsTab
                products={products}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onEditProduct={setEditingProduct}
                onSetListed={handleSetProductListed}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
          )}

          {activeTab === "seeks" && (
            <div className="pt-5">
              <SeeksTab
                seeks={seeks}
                onOpenAddSeek={() => setIsAddSeekOpen(true)}
                onEditSeek={setEditingSeek}
                onSetListed={handleSetSeekListed}
                onDeleteSeek={handleDeleteSeek}
              />
            </div>
          )}

          {activeTab === "rfqs" && (
            <div className="pt-5">
              <RfqsTab
                rfqs={rfqs}
                onOpenQuoteModal={(rfq) => setQuotingRfq(rfq)}
                onOpenChatWithBuyer={openChatForRfq}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="pt-5">
              <OrdersTab orders={orders} onUpdateStatus={handleUpdateOrderStatus} onChatWithBuyer={openChatForOrder} />
            </div>
          )}

          {activeTab === "messages" && (
            <div className="pt-5">
              <MessagesTab
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onSendMessage={handleSendMessage}
                orders={orders}
                initialContext={pendingContext}
                onContextConsumed={() => setPendingContext(null)}
              />
            </div>
          )}

          {activeTab === "account" && (
            <div className="pt-5">
              <AccountSecurityCard email={user.email} emailVerified={user.emailVerified} />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="pt-5">
              <ProfileTab
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onOpenUpgradeModal={() => setIsPricingModalOpen(true)}
              />
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Modals with Device File Uploads — mounted only while open so each opens with a fresh form */}
      {(isAddProductOpen || editingProduct) && (
        <AddProductModal
          key={editingProduct?.id ?? "new"}
          isOpen
          onClose={() => {
            setIsAddProductOpen(false);
            setEditingProduct(null);
          }}
          categories={allCategories}
          product={editingProduct ?? undefined}
          onSubmit={editingProduct ? (input) => handleUpdateProduct(editingProduct.id, input) : handleAddProduct}
        />
      )}

      {editingSeek && (
        <EditSeekModal
          key={editingSeek.id}
          seek={editingSeek}
          products={products}
          onClose={() => setEditingSeek(null)}
          onSave={handleUpdateSeek}
        />
      )}

      {isAddSeekOpen && (
        <AddSeekModal
          isOpen
          onClose={() => setIsAddSeekOpen(false)}
          products={products}
          categories={allCategories}
          onAddSeek={handleAddSeek}
        />
      )}

      {quotingRfq && (
        <RfqQuoteModal
          key={quotingRfq.id}
          rfq={quotingRfq}
          isOpen
          onClose={() => setQuotingRfq(null)}
          onSubmitQuote={handleSubmitQuote}
        />
      )}

      {/* Global Chairman Membership Pricing Modal */}
      <FactoryPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentTier={profile.tier}
        onSelectPlan={handleSelectFactoryPlan}
      />
    </div>
  );
}
