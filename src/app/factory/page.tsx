import { requireUser } from "@/features/auth/require-user";
import { FactoryDashboard } from "@/features/factory/factory-dashboard";
import { getApi } from "@/shared/api";

export const metadata = {
  title: "Manufacturer Workspace | SeekFactory Seller Hub",
  description: "Alibaba-grade B2B Seller Hub for managing machinery products, video reels, inquiries, and customer chat.",
};

export default async function FactoryHomePage() {
  const user = await requireUser("/factory");
  const api = getApi();

  const [profile, stats, products, seeks, rfqs, categories] = await Promise.all([
    api.factory.getProfile().catch(() => null),
    api.factory.getStats().catch(() => null),
    api.factory.getProducts().catch(() => []),
    api.factory.getSeeks().catch(() => []),
    api.factory.getRfqs().catch(() => []),
    api.categories.list().catch(() => []),
  ]);

  return (
    <FactoryDashboard
      user={user}
      initialProfile={profile}
      initialStats={stats}
      initialProducts={products}
      initialSeeks={seeks}
      initialRfqs={rfqs}
      allCategories={categories}
    />
  );
}
