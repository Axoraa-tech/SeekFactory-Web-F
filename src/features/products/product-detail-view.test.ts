import { isValidElement, type ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { ProductDetailView } from "./product-detail-view";
import { ProductGallery } from "@/components/ui/product-gallery";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { TrackProductView } from "@/features/analytics/track-product-view";
import type { ProductDetail } from "@/shared/api/contracts";

vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key, getLocale: async () => "en" }));
vi.mock("@/components/ui/product-action-bar", () => ({ ProductActionBar: () => null }));
vi.mock("@/features/analytics/track-product-view", () => ({ TrackProductView: () => null }));

const detail: ProductDetail = {
  product: { id: "p1", slug: "lathe", name: "Lathe", manufacturerId: "m1", imageUrl: "/image.png",
    priceInr: 100, unit: "Set", moq: "1 Set", categoryId: "c1", description: "", specs: {}, listed: false },
  manufacturer: { id: "m1", slug: "factory", name: "Factory", logoUrl: "/logo.png", coverUrl: "/cover.png",
    country: "India", location: "", verified: false, premium: false, yearsEstablished: 2020,
    factorySize: "", employees: "", exportCountries: [], description: "", followerCount: 0, categoryIds: [] },
  related: [],
};

function elements(node: ReactNode): Array<{ type: unknown; props: Record<string, unknown> }> {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [{ type: node.type, props: node.props }, ...elements(node.props.children as ReactNode)];
}

it("renders private previews without commerce, RFQ actions, or buyer analytics", async () => {
  const tree = elements(await ProductDetailView({ detail, categories: [], seekVideos: [], preview: true, order: "1" }));
  expect(tree.some((node) => node.type === ProductActionBar)).toBe(false);
  expect(tree.some((node) => node.type === TrackProductView)).toBe(false);
  expect(tree.some((node) => String(node.props.href ?? "").startsWith("/rfq/"))).toBe(false);
  expect(tree.some((node) => node.props.href === "/factory?tab=products")).toBe(true);
  expect(tree.some((node) => node.props.href === "/factory?tab=profile")).toBe(true);
});

it("retains public buyer actions, analytics and order intent by default", async () => {
  const tree = elements(await ProductDetailView({ detail, categories: [], seekVideos: [], order: "1" }));
  expect(tree.some((node) => node.type === TrackProductView)).toBe(true);
  expect(tree.find((node) => node.type === ProductActionBar)?.props.autoOpenOrder).toBe(true);
  expect(tree.some((node) => node.props.href === "/rfq/new?product=lathe")).toBe(true);
});


it.each([false, true])("shows the dedicated video before linked Seeks in preview=%s", async (preview) => {
  const videoDetail = { ...detail, product: { ...detail.product, videoUrl: "/product.mp4" } };
  const seekVideos = [{ id: "seek", videoUrl: "/seek.mp4", title: "Tour" }];
  const tree = elements(await ProductDetailView({ detail: videoDetail, categories: [], seekVideos, preview }));
  expect(tree.find((node) => node.type === ProductGallery)?.props.videos).toEqual([
    { id: "product-p1", videoUrl: "/product.mp4", title: "Lathe", posterUrl: "/image.png" },
    ...seekVideos,
  ]);
});
