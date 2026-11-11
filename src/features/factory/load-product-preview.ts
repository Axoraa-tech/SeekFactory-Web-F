import { requireSupplier } from "@/features/auth/require-user";
import { getApi } from "@/shared/api";

/** Private owner inventory, never the buyer catalogue or a fallback for public product pages. */
export async function loadProductPreview(id: string) {
  await requireSupplier(`/factory/products/${encodeURIComponent(id)}`);
  const api = getApi();
  const [products, manufacturer, categories] = await Promise.all([
    api.factory.getProducts(),
    api.factory.getProfile(),
    api.categories.list(),
  ]);
  const product = products.find((item) => item.id === id && item.manufacturerId === manufacturer.id);
  if (!product) return null;

  // Seeks are optional, but failures loading the actual product must reach the error boundary.
  const seeks = await api.factory.getSeeks().catch(() => []);
  const seekVideos = seeks
    .filter((seek) => seek.videoUrl && seek.listed !== false && seek.productIds.includes(product.id))
    .map((seek) => ({ id: seek.id, videoUrl: seek.videoUrl!, posterUrl: seek.posterUrl, title: seek.title }));

  return { detail: { product, manufacturer, related: [] }, categories, seekVideos };
}
