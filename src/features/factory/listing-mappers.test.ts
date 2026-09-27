import { describe, expect, it } from "vitest";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import { toSellerProduct, toSellerSeek } from "@/features/factory/mappers";

const product: Product = {
  id: "p1",
  slug: "lathe",
  manufacturerId: "m1",
  name: "Lathe",
  imageUrl: "/cover.png",
  description: "",
  priceInr: 100,
  unit: "Set",
  moq: "1 Set",
  categoryId: "c1",
  specs: {},
};

const reel: Reel = {
  id: "r1",
  manufacturerId: "m1",
  title: "Tour",
  description: "",
  hashtags: ["#cnc"],
  posterUrl: "/poster.png",
  videoUrl: "/v.mp4",
  durationSec: 30,
  startSec: 0,
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  tab: "for-you",
  productIds: ["p1"],
};

describe("seller listing status", () => {
  it("maps the pause switch to Active / Paused", () => {
    expect(toSellerProduct(product, []).status).toBe("Active");
    expect(toSellerProduct({ ...product, listed: true }, []).status).toBe("Active");
    expect(toSellerProduct({ ...product, listed: false }, []).status).toBe("Paused");
    expect(toSellerSeek({ ...reel, listed: false }, [], []).status).toBe("Paused");
    expect(toSellerSeek(reel, [], []).status).toBe("Published");
  });

  it("falls back to the cover when there is no gallery", () => {
    expect(toSellerProduct(product, []).imageUrls).toEqual(["/cover.png"]);
    expect(toSellerProduct({ ...product, imageUrls: ["/a.png", "/b.png"] }, []).imageUrls).toEqual(["/a.png", "/b.png"]);
  });
});
