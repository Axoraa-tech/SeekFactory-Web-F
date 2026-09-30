import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.sellerHub.title"), description: t("meta.sellerHub.description") };
}

export default async function FactoryLayout({ children }: { children: ReactNode }) {
  // Runs before the pages' loading boundary, so a signed-in buyer gets a real HTTP redirect
  // instead of a streamed one. Guests are handled by requireSupplier() in each page, which
  // keeps the requested tab in the sign-in `next` link.
  const user = await getApi().session.getCurrentUser();
  if (user && user.role !== "Supplier") redirect("/");

  return <div className="site-canvas min-h-screen">{children}</div>;
}
