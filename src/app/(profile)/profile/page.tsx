import { UserProfileDashboardLazy } from "@/components/profile/user-profile-dashboard-lazy";
import { requireUser } from "@/features/auth/require-user";
import { getApi } from "@/shared/api";

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
    </section>
  );
}
