import { describe, expect, it } from "vitest";
import { mockApi } from "@/shared/mocks/mock-api";
import { manufacturers } from "@/shared/mocks/fixtures";

// Seller hub writes must land in the same fixtures the buyer pages read.
describe("mock factory repository", () => {
  const factory = mockApi.factory;

  it("publishes a product to the seller catalog, product page and explore feed", async () => {
    const created = await factory.addProduct({
      name: "Test Hydraulic Press 400T",
      imageUrl: "/api/mock-media/abc",
      priceInr: 1200000,
      categoryId: "cat-machine-tools",
    });

    expect(created.manufacturerId).toBe(manufacturers[0].id);
    expect((await factory.getProducts()).map((p) => p.id)).toContain(created.id);
    expect((await mockApi.products.getBySlug(created.slug))?.product.id).toBe(created.id);
    expect((await mockApi.products.listTrending(50)).map((p) => p.id)).toContain(created.id);

    const again = await factory.addProduct({ ...created, name: "Test Hydraulic Press 400T" });
    expect(again.slug).not.toBe(created.slug);

    await factory.deleteProduct(created.id);
    await factory.deleteProduct(again.id);
    expect(await mockApi.products.getBySlug(created.slug)).toBeNull();
  });

  it("only lists the signed-in factory's products and seeks", async () => {
    const ownId = manufacturers[0].id;
    expect((await factory.getProducts()).every((p) => p.manufacturerId === ownId)).toBe(true);
    expect((await factory.getSeeks()).every((r) => r.manufacturerId === ownId)).toBe(true);
  });

  it("puts a new seek at the top of the buyer For You feed with its tagged product", async () => {
    const seek = await factory.addSeek({
      title: "Test forging line walkthrough",
      posterUrl: "/api/mock-media/poster",
      videoUrl: "/api/mock-media/video",
      durationSec: 41,
      productIds: ["prd-die-forging"],
      categoryIds: ["cat-machine-tools"],
    });

    const [first] = await mockApi.feed.list("for-you");
    expect(first.reel.id).toBe(seek.id);
    expect(first.reel.durationSec).toBe(41);
    expect(first.manufacturer.id).toBe(manufacturers[0].id);
    expect(first.products?.map((p) => p.id)).toEqual(["prd-die-forging"]);

    await factory.deleteSeek(seek.id);
    expect((await mockApi.feed.list("for-you"))[0].reel.id).not.toBe(seek.id);
  });

  it("marks an RFQ as quoted with price and lead time", async () => {
    const [lead] = (await factory.getRfqs()).filter((r) => r.status === "SUBMITTED");
    await factory.submitQuote(lead.id, { quotePrice: 3900000, leadTimeDays: 45, incoterm: "FOB" });

    const updated = (await factory.getRfqs()).find((r) => r.id === lead.id);
    expect(updated).toMatchObject({ status: "QUOTED", quotedPriceInr: 3900000, leadTimeDays: 45 });
    await expect(factory.submitQuote("missing", { quotePrice: 1, leadTimeDays: 1 })).rejects.toThrow();
  });

  it("persists profile edits to the public manufacturer page but not identity fields", async () => {
    const { slug, id } = manufacturers[0];
    await factory.updateProfile({ websiteUrl: "https://example.test", id: "hijack", verified: false });

    const detail = await mockApi.manufacturers.getBySlug(slug);
    expect(detail?.manufacturer.websiteUrl).toBe("https://example.test");
    expect(detail?.manufacturer.id).toBe(id);
    expect(detail?.manufacturer.verified).toBe(true);
  });
});
