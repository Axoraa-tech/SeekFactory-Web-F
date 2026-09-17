"use client";

import { useState } from "react";
import { getApi } from "@/shared/api";
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
  initialFactoryProfile,
  initialSellerConversations,
  initialSellerProducts,
  initialSellerRfqs,
  initialSellerSeeks,
  initialSellerStats,
} from "./factory-data";
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

type Props = {
  user: BuyerProfile;
};

export function FactoryDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<SellerTab>("overview");

  // State
  const [stats, setStats] = useState<SellerStats>(initialSellerStats);
  const [products, setProducts] = useState<SellerProduct[]>(initialSellerProducts);
  const [seeks, setSeeks] = useState<SellerSeek[]>(initialSellerSeeks);
  const [rfqs, setRfqs] = useState<SellerRfq[]>(initialSellerRfqs);
  const [conversations, setConversations] = useState<SellerConversation[]>(
    initialSellerConversations
  );
  const [profile, setProfile] = useState<SellerFactoryProfile>({
    ...initialFactoryProfile,
    name: user.companyName || initialFactoryProfile.name,
  });

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSeekOpen, setIsAddSeekOpen] = useState(false);
  const [quotingRfq, setQuotingRfq] = useState<SellerRfq | null>(null);

  // Unread messages count
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const newRfqsCount = rfqs.filter((r) => r.status === "New").length;

  // Handlers
  function handleAddProduct(newProd: SellerProduct) {
    setProducts((prev) => [newProd, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalProductsCount: prev.totalProductsCount + 1,
    }));

    // Synchronize into shared marketplace repository
    const api = getApi();
    void api.products.addProduct({
      id: newProd.id,
      slug: newProd.slug,
      manufacturerId: "mfr-apex",
      name: newProd.name,
      imageUrl: newProd.imageUrl,
      description: newProd.description,
      priceInr: newProd.priceInr,
      unit: newProd.unit,
      moq: newProd.moq,
      categoryId: newProd.categoryId,
      specs: newProd.specs,
    });
  }

  function handleDeleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({
      ...prev,
      totalProductsCount: Math.max(0, prev.totalProductsCount - 1),
    }));
  }

  function handleAddSeek(newSeek: SellerSeek) {
    setSeeks((prev) => [newSeek, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalSeeksCount: prev.totalSeeksCount + 1,
    }));

    // Synchronize into shared buyer feed repository
    const api = getApi();
    void api.feed.addReel({
      id: newSeek.id,
      manufacturerId: "mfr-apex",
      videoUrl: newSeek.videoUrl,
      posterUrl: newSeek.thumbnailUrl,
      title: newSeek.title,
      description: newSeek.title,
      hashtags: ["#manufacturing", "#machinery", "#b2b"],
      durationSec: newSeek.durationSeconds,
      startSec: 0,
      views: newSeek.viewsCount,
      likes: newSeek.likesCount,
      comments: newSeek.commentsCount,
      shares: 0,
      saves: 0,
      tab: "for-you",
      productIds: [products[0]?.id || "prod-apex-1"],
    });
  }

  function handleDeleteSeek(id: string) {
    setSeeks((prev) => prev.filter((s) => s.id !== id));
    setStats((prev) => ({
      ...prev,
      totalSeeksCount: Math.max(0, prev.totalSeeksCount - 1),
    }));
  }

  function handleSubmitQuote(
    rfqId: string,
    quotedPriceInr: number,
    leadTimeDays: number,
    replyNotes: string
  ) {
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
                  lastMessage: `Formal Quote Sent: ₹${quotedPriceInr.toLocaleString()}`,
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
                        detail: `Lead time: ${leadTimeDays} days. Delivery Port: ${targetRfq.deliveryPort}`,
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
                  id: `msg-${Date.now()}`,
                  sender: "seller",
                  text,
                  timestamp: "Just now",
                },
              ],
            }
          : c
      )
    );
  }

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

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
      {/* Salespro Left Sidebar */}
      <SalesproSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        productsCount={products.length}
        seeksCount={seeks.length}
        rfqsCount={newRfqsCount}
        unreadMessagesCount={unreadMessagesCount}
        profile={profile}
        userName={user.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {/* Top Header with title & action buttons */}
          <SalesproTopbar
            activeTab={activeTab}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onOpenAddSeek={() => setIsAddSeekOpen(true)}
            profile={profile}
          />

          {/* Tab Views */}
          {activeTab === "overview" && (
            <SalesproOverviewView
              stats={stats}
              products={products}
              seeks={seeks}
              rfqs={rfqs}
              profile={profile}
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
                onSendMessage={handleSendMessage}
              />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="pt-5">
              <ProfileTab
                profile={profile}
                onUpdateProfile={(updated) =>
                  setProfile((prev) => ({ ...prev, ...updated }))
                }
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals with Device File Uploads */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <AddSeekModal
        isOpen={isAddSeekOpen}
        onClose={() => setIsAddSeekOpen(false)}
        products={products}
        onAddSeek={handleAddSeek}
      />

      <RfqQuoteModal
        rfq={quotingRfq}
        isOpen={!!quotingRfq}
        onClose={() => setQuotingRfq(null)}
        onSubmitQuote={handleSubmitQuote}
      />
    </div>
  );
}
