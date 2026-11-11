import type { Product } from "@/entities/product";
import type { GalleryVideo } from "@/components/ui/product-gallery";
import { toStoredMediaUrl } from "@/shared/api/http-api";

/** Product video first; a linked Seek using the same stored media appears only once. */
export function productGalleryVideos(product: Product, seeks: GalleryVideo[]): GalleryVideo[] {
  const videos: GalleryVideo[] = product.videoUrl
    ? [{ id: `product-${product.id}`, videoUrl: product.videoUrl, posterUrl: product.imageUrl, title: product.name }, ...seeks]
    : seeks;
  const seen = new Set<string>();
  return videos.filter((video) => {
    const key = toStoredMediaUrl(video.videoUrl.trim());
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
