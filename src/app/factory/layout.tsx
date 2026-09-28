import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getApi } from "@/shared/api";

export const metadata = {
  title: "Seller Hub & Manufacturer Center | SeekFactory",
  description: "Manage your industrial factory profile, machinery products, video seeks, and buyer RFQs.",
};

export default async function FactoryLayout({ children }: { children: ReactNode }) {
  // Runs before the pages' loading boundary, so a signed-in buyer gets a real HTTP redirect
  // instead of a streamed one. Guests are handled by requireSupplier() in each page, which
  // keeps the requested tab in the sign-in `next` link.
  const user = await getApi().session.getCurrentUser();
  if (user && user.role !== "Supplier") redirect("/");

  return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
}
