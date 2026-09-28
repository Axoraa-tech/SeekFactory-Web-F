import { redirect } from "next/navigation";
import { getApi } from "@/shared/api";
import type { BuyerProfile } from "@/entities/user";

/**
 * Returns the signed-in user, or sends a guest to sign in and back to `nextPath` afterwards.
 */
export async function requireUser(nextPath: string): Promise<BuyerProfile> {
  const user = await getApi().session.getCurrentUser();
  if (!user) {
    const params = new URLSearchParams({ next: nextPath });
    if (nextPath.startsWith("/factory")) params.set("role", "manufacturer");
    redirect(`/login?${params}`);
  }
  return user;
}

/**
 * Seller hub pages: guests go to sign in (manufacturer tab preselected); a signed-in buyer
 * is sent back to the buyer home. The backend enforces ROLE_SUPPLIER on /factory APIs as
 * well; this keeps buyers from landing on an empty seller dashboard.
 */
export async function requireSupplier(nextPath: string): Promise<BuyerProfile> {
  const user = await requireUser(nextPath);
  if (user.role !== "Supplier") redirect("/");
  return user;
}
