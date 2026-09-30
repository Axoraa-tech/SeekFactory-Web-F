import { notFound } from "next/navigation";
import { SupplierProfileView } from "@/components/profile/supplier-profile-view";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations();
  const { slug } = await params;
  const detail = await getApi().manufacturers.getBySlug(slug);
  return {
    title: detail?.manufacturer.name ?? t("pages.manufacturer.manufacturerProfile"),
    description: detail?.manufacturer.description,
  };
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
