import { requireSupplier } from "@/features/auth/require-user";
import { FactoryDashboard } from "@/features/factory/factory-dashboard";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.sellerWorkspace.title"), description: t("meta.sellerWorkspace.description") };
}

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function FactoryHomePage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const user = await requireSupplier(tab ? `/factory?tab=${encodeURIComponent(tab)}` : "/factory");
  const api = getApi();

  const [profile, stats, products, seeks, rfqs, categories, convosRaw, orders, verification] = await Promise.all([
    api.factory.getProfile().catch(() => null),
    api.factory.getStats().catch(() => null),
    api.factory.getProducts().catch(() => []),
    api.factory.getSeeks().catch(() => []),
    api.factory.getRfqs().catch(() => []),
    api.categories.list().catch(() => []),
    api.messages.listRecent().catch(() => []),
    api.factory.getOrders().catch(() => []),
    api.factory.getVerification().catch(() => null),
  ]);

  // Map Backend Conversations to SellerConversations for the Dashboard
  const initialConversations = convosRaw.map((c) => ({
    id: c.id,
    buyerId: c.buyerId || "b-0",
    buyerName: c.buyerName || "Buyer", 
    buyerCompany: c.buyerCompany || "Global Buyer",
    buyerCountry: "Global", // Can be added to backend later if needed
    buyerAvatarUrl: c.buyerAvatarUrl || "https://images.seekfactory.com/logos/default.png",
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
      initialOrders={orders}
      initialConversations={initialConversations}
      allCategories={categories}
      verification={verification}
    />
  );
}
