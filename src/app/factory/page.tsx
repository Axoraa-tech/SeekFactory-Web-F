import { requireUser } from "@/features/auth/require-user";
import { FactoryDashboard } from "@/features/factory/factory-dashboard";
import { getApi } from "@/shared/api";

export const metadata = {
  title: "Manufacturer Workspace | SeekFactory Seller Hub",
  description: "Alibaba-grade B2B Seller Hub for managing machinery products, video reels, inquiries, and customer chat.",
};

export const dynamic = "force-dynamic";

export default async function FactoryHomePage() {
  const user = await requireUser("/factory");
  const api = getApi();

  const [profile, stats, products, seeks, rfqs, categories, convosRaw] = await Promise.all([
    api.factory.getProfile().catch(() => null),
    api.factory.getStats().catch(() => null),
    api.factory.getProducts().catch(() => []),
    api.factory.getSeeks().catch(() => []),
    api.factory.getRfqs().catch(() => []),
    api.categories.list().catch(() => []),
    api.messages.listRecent().catch(() => []),
  ]);

  // Map Backend Conversations to SellerConversations for the Dashboard
  const initialConversations = convosRaw.map((c) => ({
    id: c.id,
    buyerId: "b-0", // Default or extract if backend provides
    buyerName: "Buyer", 
    buyerCompany: c.manufacturer?.name || "Global Buyer",
    buyerCountry: c.manufacturer?.country || "Unknown",
    buyerAvatarUrl: c.manufacturer?.logoUrl || "https://images.seekfactory.com/logos/default.png",
    lastMessage: c.lastMessage || "",
    lastMessageTime: c.lastMessageAt || "Recently",
    unreadCount: c.unreadCount || 0,
    status: "active" as const,
    messages: [], // Full messages aren't returned in listRecent
  }));

  return (
    <FactoryDashboard
      user={user}
      initialProfile={profile}
      initialStats={stats}
      initialProducts={products}
      initialSeeks={seeks}
      initialRfqs={rfqs}
      initialConversations={initialConversations}
      allCategories={categories}
    />
  );
}
