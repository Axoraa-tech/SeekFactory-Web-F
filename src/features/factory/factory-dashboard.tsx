"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getApi } from "@/shared/api";
import type { FactoryQuote, NewFactoryProduct, NewFactorySeek } from "@/shared/api/contracts";
import type { BuyerProfile } from "@/entities/user";
import type {
  SellerConversation,
  SellerFactoryProfile,
  SellerProduct,
  SellerRfq,
  SellerSeek,
  SellerStats,
  SellerTab,
} from "./types";
import {
  createProductAction,
  createSeekAction,
  deleteProductAction,
  deleteSeekAction,
  submitQuoteAction,
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
import { AddProductModal } from "./components/add-product-modal";
import { AddSeekModal } from "./components/add-seek-modal";
import { RfqQuoteModal } from "./components/rfq-quote-modal";
import { FactoryPricingModal, type FactoryPlanTier } from "./components/factory-pricing-modal";

import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import type { RfqItem } from "@/entities/rfq";
import type { Category } from "@/entities/category";

type Props = {
  user: BuyerProfile;
  initialProfile?: Manufacturer | null;
  initialStats?: SellerStats | null;
  initialProducts?: Product[];
  initialSeeks?: Reel[];
  initialRfqs?: RfqItem[];
  initialConversations?: SellerConversation[];
  allCategories?: Category[];
};

// Stable defaults: fresh `[]` literals would retrigger the prop-sync effects every render.
const NO_PRODUCTS: Product[] = [];
const NO_SEEKS: Reel[] = [];
const NO_RFQS: RfqItem[] = [];
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
  initialConversations = NO_CONVERSATIONS,
  allCategories = NO_CATEGORIES,
}: Props) {
  const [activeTab, setActiveTab] = useState<SellerTab>("overview");
  const [stats, setStats] = useState<SellerStats>(initialStats ?? EMPTY_STATS);
  const [products, setProducts] = useState<SellerProduct[]>(() =>
    initialProducts.map((p) => toSellerProduct(p, allCategories))
  );
  const [seeks, setSeeks] = useState<SellerSeek[]>(() =>
    initialSeeks.map((s) => toSellerSeek(s, allCategories, initialProducts))
  );
  const [rfqs, setRfqs] = useState<SellerRfq[]>(() => initialRfqs.map(toSellerRfq));
  const [conversations, setConversations] = useState<SellerConversation[]>(initialConversations);
  const [profile, setProfile] = useState<SellerFactoryProfile>(() => toSellerProfile(initialProfile, user));
  // Surfaces failures from actions that have no modal of their own (e.g. deletes).
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSeekOpen, setIsAddSeekOpen] = useState(false);
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
    setRfqs(initialRfqs.map(toSellerRfq));
  }, [initialRfqs]);

  useEffect(() => {
    // Plan tier is local-only until billing exists, so keep it across refreshes.
    setProfile((prev) => toSellerProfile(initialProfile, user, prev.tier));
  }, [initialProfile, user]);

  useEffect(() => {
    if (initialStats) setStats(initialStats);
  }, [initialStats]);

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

  // Handlers — add/quote/profile throw on failure so the calling modal or form can show the error.
  async function handleAddProduct(input: NewFactoryProduct) {
    const result = await createProductAction(input);
    if (!result.ok) throw new Error(result.error);
    const created = toSellerProduct(result.data, allCategories);
    setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    setStats((prev) => ({ ...prev, totalProductsCount: prev.totalProductsCount + 1 }));
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

  async function handleSubmitQuote(rfqId: string, quote: FactoryQuote) {
    const result = await submitQuoteAction(rfqId, quote);
    if (!result.ok) throw new Error(result.error);

    const quotedPriceInr = quote.quotePrice;
    const leadTimeDays = quote.leadTimeDays;
    const replyNotes = quote.notes ?? "";
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId
          ? {
              ...r,
              status: "Quoted",
              quotedPriceInr,
              leadTimeDays,
            }
          : r
      )
    );

    // Also send quotation into trade messenger if buyer conversation exists
    const targetRfq = rfqs.find((r) => r.id === rfqId);
    if (targetRfq) {
      const existingConv = conversations.find(
        (c) => c.buyerCompany.toLowerCase() === targetRfq.buyerCompany.toLowerCase()
      );
      if (existingConv) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === existingConv.id
              ? {
                  ...c,
                  lastMessage: `Formal Quote Sent: ₹${(quotedPriceInr ?? 0).toLocaleString()}`,
                  lastMessageTime: "Just now",
                  messages: [
                    ...c.messages,
                    {
                      id: `msg-${Date.now()}`,
                      sender: "seller",
                      text: replyNotes,
                      timestamp: "Just now",
                      attachmentType: "quote",
                      attachmentData: {
                        title: `Official Quotation for ${targetRfq.productName}`,
                        detail: `Lead time: ${leadTimeDays} days. Terms: ${quote.incoterm || targetRfq.deliveryPort}`,
                        price: quotedPriceInr,
                      },
                    },
                  ],
                }
              : c
          )
        );
      }
    }
  }

  function handleSendMessage(conversationId: string, text: string) {
    if (!text.trim()) return;
    
    // Optimistic UI update
    const tempId = `msg-${Date.now()}`;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: "Just now",
              unreadCount: 0,
              messages: [
                ...c.messages,
                {
                  id: tempId,
                  sender: "seller",
                  text,
                  timestamp: "Just now",
                },
              ],
            }
          : c
      )
    );

    // Call actual backend API
    getApi()
      .messages.sendMessage(conversationId, text)
      .then((savedMsg) => {
        // We could update the message ID here if needed, but optimistic is fine for now
      })
      .catch((err) => {
        console.error("Failed to send message", err);
      });
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
                messages: msgs.map((m) => ({
                  id: m.id,
                  sender: m.sender === "factory" ? "seller" : "buyer",
                  text: m.text,
                  timestamp: m.time,
                  attachmentType: m.attachment ? "image" : undefined,
                  attachmentData: m.attachment ? { title: m.attachment.name, detail: m.attachment.size } : undefined,
                })),
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
            return {
              ...c,
              lastMessage: newMsg.text,
              lastMessageTime: newMsg.time,
              messages: [
                ...c.messages,
                {
                  id: newMsg.id,
                  sender: newMsg.sender === "factory" ? "seller" : "buyer",
                  text: newMsg.text,
                  timestamp: newMsg.time,
                  attachmentType: newMsg.attachment ? "image" : undefined,
                  attachmentData: newMsg.attachment ? { title: newMsg.attachment.name, detail: newMsg.attachment.size } : undefined,
                },
              ],
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

  function handleOpenChatWithBuyer(buyerCompany: string) {
    const targetConv = conversations.find(
      (c) => c.buyerCompany.toLowerCase() === buyerCompany.toLowerCase()
    );
    if (targetConv) {
      setActiveConversationId(targetConv.id);
    }
    setActiveTab("messages");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Salespro Left Sidebar (Responsive drawer on mobile) */}
      <SalesproSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        productsCount={products.length}
        seeksCount={seeks.length}
        rfqsCount={newRfqsCount}
        unreadMessagesCount={unreadMessagesCount}
        profile={profile}
        userName={user.name}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenUpgradeModal={() => setIsPricingModalOpen(true)}
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

          {/* Tab Views */}
          {activeTab === "overview" && (
            <SalesproOverviewView
              profile={profile}
              stats={stats}
              products={products}
              seeks={seeks}
              rfqs={rfqs}
              onOpenQuoteModal={(rfq) => setQuotingRfq(rfq)}
            />
          )}

          {activeTab === "products" && (
            <div className="pt-5">
              <ProductsTab
                products={products}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
          )}

          {activeTab === "seeks" && (
            <div className="pt-5">
              <SeeksTab
                seeks={seeks}
                onOpenAddSeek={() => setIsAddSeekOpen(true)}
                onDeleteSeek={handleDeleteSeek}
              />
            </div>
          )}

          {activeTab === "rfqs" && (
            <div className="pt-5">
              <RfqsTab
                rfqs={rfqs}
                onOpenQuoteModal={(rfq) => setQuotingRfq(rfq)}
                onOpenChatWithBuyer={handleOpenChatWithBuyer}
              />
            </div>
          )}

          {activeTab === "messages" && (
            <div className="pt-5">
              <MessagesTab
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onSendMessage={handleSendMessage}
              />
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
        </main>
      </div>

      {/* Modals with Device File Uploads — mounted only while open so each opens with a fresh form */}
      {isAddProductOpen && (
        <AddProductModal
          isOpen
          onClose={() => setIsAddProductOpen(false)}
          categories={allCategories}
          onAddProduct={handleAddProduct}
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
