"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export function FactoryDashboard({
  user,
  initialProfile,
  initialStats,
  initialProducts = [],
  initialSeeks = [],
  initialRfqs = [],
  initialConversations = [],
  allCategories: _allCategories = [],
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SellerTab>("overview");

  const [stats, setStats] = useState<SellerStats>(() => {
    if (initialStats) {
      return initialStats;
    }
    return {
      totalProductViews: 0,
      productViewsChange: 0,
      factoryProfileVisits: 0,
      profileVisitsChange: 0,
      videoSeekPlays: 0,
      videoPlaysChange: 0,
      activeRfqsCount: 0,
      pendingRfqsCount: 0,
      responseRatePercent: 0,
      avgResponseTimeHours: 0,
      followerCount: 0,
      totalProductsCount: 0,
      totalSeeksCount: 0,
    };
  });

  const [products, setProducts] = useState<SellerProduct[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        category: "Industrial Machinery",
        categoryId: p.categoryId,
        priceInr: p.priceInr,
        unit: p.unit,
        moq: p.moq,
        status: "Active" as const,
        viewsCount: 1420,
        inquiriesCount: 18,
        specs: p.specs,
        description: p.description,
        createdAt: "Recently",
      }));
    }
    return [];
  });

  const [seeks, setSeeks] = useState<SellerSeek[]>(() => {
    if (initialSeeks && initialSeeks.length > 0) {
      return initialSeeks.map((s) => ({
        id: s.id,
        title: s.title,
        videoUrl: s.videoUrl || "",
        thumbnailUrl: s.posterUrl,
        durationSeconds: s.durationSec,
        viewsCount: s.views,
        likesCount: s.likes,
        commentsCount: s.comments,
        inquiriesGenerated: 12,
        category: "Factory Production",
        createdAt: "Recently",
        status: "Published" as const,
      }));
    }
    return [];
  });

  const [rfqs, setRfqs] = useState<SellerRfq[]>(() => {
    if (initialRfqs && initialRfqs.length > 0) {
      return initialRfqs.map((r) => ({
        id: r.id,
        buyerName: r.companyName || "Verified Industrial Buyer",
        buyerCompany: r.companyName || "Global Sourcing Ltd",
        buyerCountry: "India",
        productName: r.productName,
        productCategory: r.details?.split("]")[0]?.replace("[", "") || "Machinery",
        quantityRequested: `${r.quantity} ${r.unit || "Pieces"}`,
        targetBudgetInr: r.targetPrice && !isNaN(Number(r.targetPrice)) ? Number(r.targetPrice) : undefined,
        deliveryPort: r.incoterm || "FOB",
        status: (r.status === "SUBMITTED" ? "New" : "Responded") as SellerRfq["status"],
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
        requirements: r.details || "",
      }));
    }
    return [];
  });

  const [conversations, setConversations] = useState<SellerConversation[]>(
    initialConversations
  );

  const [profile, setProfile] = useState<SellerFactoryProfile>(() => {
    if (initialProfile) {
      return {
        name: initialProfile.name,
        slug: initialProfile.slug,
        logoUrl: initialProfile.logoUrl,
        coverUrl: initialProfile.coverUrl,
        country: initialProfile.country,
        location: initialProfile.location,
        yearsEstablished: initialProfile.yearsEstablished,
        factorySize: initialProfile.factorySize,
        employees: initialProfile.employees,
        annualTurnover: "$10M - $25M USD",
        exportCountries: initialProfile.exportCountries,
        certifications: ["ISO 9001:2015", "CE Certified", "RoHS Compliant"],
        description: initialProfile.description,
        productionLines: 8,
        verified: initialProfile.verified,
        tier: "Gold Plus Verified",
      };
    }
    return {
      name: user.companyName || "Verified Factory",
      slug: "",
      logoUrl: "https://images.seekfactory.com/logos/default.png",
      coverUrl: "https://images.seekfactory.com/covers/default.jpg",
      country: "China",
      location: "Zhejiang, China",
      yearsEstablished: 12,
      factorySize: "20,000 sq.m",
      employees: "200-500",
      annualTurnover: "$10M - $25M USD",
      exportCountries: ["India", "USA", "Germany"],
      certifications: ["ISO 9001:2015", "CE Certified", "RoHS Compliant"],
      description: "",
      productionLines: 8,
      verified: true,
      tier: "Verified",
    };
  });
  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSeekOpen, setIsAddSeekOpen] = useState(false);
  const [quotingRfq, setQuotingRfq] = useState<SellerRfq | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Sync state with server props on Next.js soft navigation or refresh
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        category: "Industrial Machinery",
        categoryId: p.categoryId,
        priceInr: p.priceInr,
        unit: p.unit,
        moq: p.moq,
        status: "Active" as const,
        viewsCount: 1420,
        inquiriesCount: 18,
        specs: p.specs,
        description: p.description,
        createdAt: "Recently",
      })));
    }
  }, [initialProducts]);

  useEffect(() => {
    if (initialSeeks) {
      setSeeks(initialSeeks.map((s) => ({
        id: s.id,
        title: s.title,
        thumbnailUrl: s.posterUrl,
        videoUrl: s.videoUrl || "",
        viewsCount: s.views,
        likesCount: s.likes,
        commentsCount: s.comments,
        inquiriesGenerated: s.saves,
        durationSeconds: s.durationSec,
        category: s.categoryIds && s.categoryIds.length > 0 ? s.categoryIds[0] : "Manufacturing",
        status: "Published" as const,
        createdAt: "Recently",
      })));
    }
  }, [initialSeeks]);

  useEffect(() => {
    if (initialRfqs) {
      setRfqs(initialRfqs.map((r) => ({
        id: r.id,
        buyerName: "Unknown Buyer",
        buyerCompany: r.companyName || "Unknown Company",
        buyerCountry: "Unknown",
        productName: r.productName,
        productCategory: "Uncategorized",
        quantityRequested: `${r.quantity} ${r.unit || ""}`,
        deliveryPort: r.incoterm || "Unknown",
        status: "New",
        createdAt: r.createdAt,
        requirements: r.details || "",
      })));
    }
  }, [initialRfqs]);

  useEffect(() => {
    if (initialConversations) setConversations(initialConversations);
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

  // Handlers
  async function handleAddProduct(newProd: SellerProduct) {
    setProducts((prev) => [newProd, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalProductsCount: prev.totalProductsCount + 1,
    }));

    try {
      await getApi().factory.addProduct({
        name: newProd.name,
        imageUrl: newProd.imageUrl,
        description: newProd.description,
        priceInr: newProd.priceInr,
        unit: newProd.unit,
        moq: newProd.moq,
        categoryId: newProd.categoryId,
        specs: newProd.specs,
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to persist product to factory backend:", err);
    }
  }

  async function handleDeleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({
      ...prev,
      totalProductsCount: Math.max(0, prev.totalProductsCount - 1),
    }));

    try {
      await getApi().factory.deleteProduct(id);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete product from backend:", err);
    }
  }

  async function handleAddSeek(newSeek: SellerSeek) {
    setSeeks((prev) => [newSeek, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalSeeksCount: prev.totalSeeksCount + 1,
    }));

    try {
      await getApi().factory.addSeek({
        title: newSeek.title,
        description: newSeek.title,
        posterUrl: newSeek.thumbnailUrl,
        videoUrl: newSeek.videoUrl,
        durationSec: newSeek.durationSeconds,
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to persist reel to factory backend:", err);
    }
  }

  async function handleDeleteSeek(id: string) {
    setSeeks((prev) => prev.filter((s) => s.id !== id));
    setStats((prev) => ({
      ...prev,
      totalSeeksCount: Math.max(0, prev.totalSeeksCount - 1),
    }));

    try {
      await getApi().factory.deleteSeek(id);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete reel from backend:", err);
    }
  }

  async function handleSubmitQuote(
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

    try {
      await getApi().factory.submitQuote(rfqId, {
        quotePrice: quotedPriceInr,
        currency: "INR",
        leadTimeDays,
        notes: replyNotes,
      });
    } catch (err) {
      console.error("Failed to submit quotation to backend:", err);
    }

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
                onOpenUpgradeModal={() => setIsPricingModalOpen(true)}
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
