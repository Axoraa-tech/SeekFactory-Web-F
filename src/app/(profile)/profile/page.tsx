import { UserProfileDashboard } from "@/components/profile/user-profile-dashboard";
import { requireUser } from "@/features/auth/require-user";
import { getApi } from "@/shared/api";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [products, manufacturers] = await Promise.all([
    getApi().products.listTrending(6),
    getApi().manufacturers.listAll(),
  ]);

  return (
    <section className="space-y-4">
      <UserProfileDashboard
        user={user}
        initialProducts={products}
        initialManufacturers={manufacturers}
      />
    </section>
  );
}

