import { UserProfileDashboardLazy } from "@/components/profile/user-profile-dashboard-lazy";
import { requireUser } from "@/features/auth/require-user";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const api = getApi();
  const [savedProducts, savedSeeks, following, myRfqs, categories] = await Promise.all([
    api.products.listSaved(),
    api.feed.listSaved(),
    api.manufacturers.listFollowing(),
    api.rfq.listMyRfqs(),
    api.categories.list(),
  ]);

  return (
    <section className="space-y-4">
      <UserProfileDashboardLazy
        user={user}
        initialSavedProducts={savedProducts}
        initialSavedSeeks={savedSeeks}
        initialFollowing={following}
        initialRfqs={myRfqs}
        categories={categories}
      />
    </section>
  );
}
