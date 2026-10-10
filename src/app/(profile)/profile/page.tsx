import { UserProfileDashboardLazy } from "@/components/profile/user-profile-dashboard-lazy";
import { requireUser } from "@/features/auth/require-user";
import { AccountSecurityCard } from "@/features/auth/account-security-card";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";
import { PartyPopper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const t = await getTranslations();
  const api = getApi();
  // Started alongside the session check rather than after it (a guest is redirected anyway)
  const data = Promise.all([
    api.products.listSaved(),
    api.feed.listSaved(),
    api.manufacturers.listFollowing(),
    api.rfq.listMyRfqs(),
    api.categories.list(),
  ]);
  data.catch(() => {}); // a guest's 401s are dropped when requireUser redirects
  const user = await requireUser("/profile");
  const [savedProducts, savedSeeks, following, myRfqs, categories] = await data;

  return (
    <section className="space-y-4">
      {welcome === "1" && (
        <div className="glass-panel glass-fade-in flex items-start gap-3 px-4 py-3.5 sm:px-5">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
          <div>
            <p className="text-sm font-bold text-ink">{t("profile.avatar.welcomeTitle")}</p>
            <p className="mt-0.5 text-xs sm:text-sm text-ink-muted">{t("profile.avatar.welcomeBody")}</p>
          </div>
        </div>
      )}
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
