import { UserProfileDashboardLazy } from "@/components/profile/user-profile-dashboard-lazy";
import { requireUser } from "@/features/auth/require-user";
import { AccountSecurityCard } from "@/features/auth/account-security-card";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const api = getApi();
  const [products, manufacturers, myRfqs] = await Promise.all([
    api.products.listTrending(6),
    api.manufacturers.listAll(),
    api.rfq.listMyRfqs(),
  ]);

  return (
    <section className="space-y-4">
      <UserProfileDashboardLazy
        user={user}
        initialProducts={products}
        initialManufacturers={manufacturers}
        initialRfqs={myRfqs}
      />
      <div id="account-security" className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900">Account &amp; Security</h2>
        <AccountSecurityCard email={user.email} emailVerified={user.emailVerified} />
      </div>
    </section>
  );
}
