import { getApi } from "@/shared/api";
import type { BuyerProfile } from "@/entities/user";

export const GUEST_BUYER_FALLBACK: BuyerProfile = {
  id: "user-guest",
  name: "Guest Buyer",
  role: "Buyer",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  companyName: "Global Sourcing Corp (Guest)",
  industry: "Industrial sourcing",
  country: "India",
};

import { redirect } from "next/navigation";

export async function requireUser(nextPath?: string): Promise<BuyerProfile> {
  const user = await getApi().session.getCurrentUser();
  if (!user && nextPath) {
    const roleParam = nextPath.startsWith("/factory") ? "?role=manufacturer" : "";
    redirect(`/login${roleParam}`);
  }
  return user ?? GUEST_BUYER_FALLBACK;
}




