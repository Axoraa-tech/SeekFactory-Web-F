import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/features/auth/require-user";
import { displayRole } from "@/features/auth/session-cookie";

export const metadata = { title: "Factory home" };

export default async function FactoryHomePage() {
  const user = await requireUser("/factory");

  return (
    <Card className="p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">Manufacturer workspace</p>
      <h1 className="mt-2 text-2xl font-bold">Welcome, {user.companyName}</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Signed in as {user.name} ({displayRole(user.role)}). Video upload, analytics, and lead inbox ship in a later
        milestone. This page keeps manufacturers out of the buyer Reels feed after Join.
      </p>
      {user.role === "Buyer" ? (
        <p className="mt-4 text-sm text-ink-muted">
          You joined as a buyer.{" "}
          <Link href="/" className="font-semibold text-brand-blue">
            Go to Reels
          </Link>
        </p>
      ) : (
        <div className="mt-6 flex gap-3">
          <Link href="/explore" className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
            See buyer marketplace
          </Link>
          <Link href="/profile" className="rounded-lg border border-line px-4 py-2 text-sm font-semibold">
            Account
          </Link>
        </div>
      )}
    </Card>
  );
}
