import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LogoutButton } from "@/features/auth/logout-button";
import { requireUser } from "@/features/auth/require-user";
import { displayRole } from "@/features/auth/session-cookie";

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  return (
    <section>
      <PageHeader title="Profile" description="Mock session from Join / Sign in. Real auth comes with the backend." />
      <Card className="flex items-center gap-4 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        <div>
          <h2 className="text-lg font-bold">{user.name}</h2>
          <p className="text-sm text-ink-muted">
            {displayRole(user.role)} · {user.companyName}
          </p>
          <p className="text-sm text-ink-muted">
            {user.industry} · {user.country}
          </p>
          <LogoutButton />
        </div>
      </Card>
      <Card className="mt-4 p-5">
        <h3 className="font-semibold">Premium</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Upgrade is a UI placeholder. Billing stays out of this frontend milestone.
        </p>
      </Card>
    </section>
  );
}
