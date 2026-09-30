import { UserProfileDashboardLazy } from "@/components/profile/user-profile-dashboard-lazy";
import { requireUser } from "@/features/auth/require-user";
import { AccountSecurityCard } from "@/features/auth/account-security-card";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = await getTranslations();
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
      <div id="account-security" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900">{t("profile.page.accountSecurity")}</h2>
        <AccountSecurityCard email={user.email} emailVerified={user.emailVerified} />
      </div>
    </section>
  );
}
