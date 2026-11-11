import { notFound } from "next/navigation";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";
import { ProductDetailView } from "@/features/products/product-detail-view";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations();
  const { slug } = await params;
  const detail = await getApi().products.getBySlug(slug);
  return {
    title: detail?.product.name ?? t("product.page.productDetails"),
    description: detail?.product.description,
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { order } = await searchParams;
  const api = getApi();
  const [detail, categories] = await Promise.all([api.products.getBySlug(slug), api.categories.list()]);
  if (!detail) notFound();

  // Public pages retain the backend's visibility checks. Never fall back to seller inventory here.
  const factory = await api.manufacturers.getBySlug(detail.manufacturer.slug).catch(() => null);
  const seekVideos = (factory?.reels ?? [])
    .filter((r) => r.videoUrl && r.listed !== false && r.productIds.includes(detail.product.id))
    .map((r) => ({ id: r.id, videoUrl: r.videoUrl!, posterUrl: r.posterUrl, title: r.title }));

  return <ProductDetailView detail={detail} categories={categories} seekVideos={seekVideos} order={order} />;
}
