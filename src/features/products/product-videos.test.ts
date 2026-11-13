import { describe, expect, it } from "vitest";
import { productGalleryVideos } from "./product-videos";
import type { Product } from "@/entities/product";

const product = { id: "p1", name: "Lathe", imageUrl: "/cover.png", videoUrl: "/machine.mp4" } as Product;
const seeks = [
  { id: "same", title: "Linked", videoUrl: "/machine.mp4" },
  { id: "other", title: "Factory", videoUrl: "/factory.mp4" },
];
describe("product gallery videos", () => {
  it("puts the dedicated video first and deduplicates linked Seeks", () => {
    expect(productGalleryVideos(product, seeks)).toEqual([
      { id: "product-p1", title: "Lathe", videoUrl: "/machine.mp4", posterUrl: "/cover.png" }, seeks[1],
    ]);
  });
  it("preserves linked Seeks for legacy photo-only products", () => {
    expect(productGalleryVideos({ ...product, videoUrl: undefined }, seeks)).toEqual(seeks);
    expect(productGalleryVideos({ ...product, videoUrl: undefined }, [])).toEqual([]);
  });
});
