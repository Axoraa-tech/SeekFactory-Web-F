import { notFound } from "next/navigation";
import { SupplierProfileView } from "@/components/profile/supplier-profile-view";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ slug: string }>;
};

// Supplier identity (name, full description) is reserved for buyers who unlocked it, and page
// metadata is shown to everyone (browser tab, link previews, search results), so it stays generic.
export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("pages.manufacturer.manufacturerProfile") };
}

export default async function ManufacturerPage({ params }: Props) {
  const { slug } = await params;
  const api = getApi();
  const detail = await api.manufacturers.getBySlug(slug);
  if (!detail) notFound();

  const allManufacturers = await api.manufacturers.listAll();

  return (
    <SupplierProfileView
      manufacturer={detail.manufacturer}
      products={detail.products}
      reels={detail.reels}
      allManufacturers={allManufacturers}
      certifications={detail.certifications}
      responseRatePercent={detail.responseRatePercent}
      avgResponseTimeHours={detail.avgResponseTimeHours}
      followedByMe={detail.followedByMe}
    />
  );
}
