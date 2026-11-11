import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadProductPreview } from "./load-product-preview";

const mocks = vi.hoisted(() => ({
  requireSupplier: vi.fn(),
  getProducts: vi.fn(), getProfile: vi.fn(), getSeeks: vi.fn(), listCategories: vi.fn(),
  publicProduct: vi.fn(),
}));
vi.mock("@/features/auth/require-user", () => ({ requireSupplier: mocks.requireSupplier }));
vi.mock("@/shared/api", () => ({ getApi: () => ({
  factory: { getProducts: mocks.getProducts, getProfile: mocks.getProfile, getSeeks: mocks.getSeeks },
  categories: { list: mocks.listCategories },
  products: { getBySlug: mocks.publicProduct },
}) }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireSupplier.mockResolvedValue({ id: "seller", role: "Supplier" });
  mocks.getProducts.mockResolvedValue([{ id: "p1", manufacturerId: "m1", listed: false, specs: {} }]);
  mocks.getProfile.mockResolvedValue({ id: "m1", verified: false });
  mocks.getSeeks.mockResolvedValue([]);
  mocks.listCategories.mockResolvedValue([]);
});

describe("private owner product preview", () => {
  it("previews a paused product from an unverified factory using only the owner's APIs", async () => {
    const preview = await loadProductPreview("p1");
    expect(mocks.requireSupplier).toHaveBeenCalledWith("/factory/products/p1");
    expect(preview?.detail.product.listed).toBe(false);
    expect(preview?.detail.manufacturer.verified).toBe(false);
    expect(mocks.publicProduct).not.toHaveBeenCalled();
  });

  it("also previews active products", async () => {
    mocks.getProducts.mockResolvedValue([{ id: "p1", manufacturerId: "m1", listed: true }]);
    expect((await loadProductPreview("p1"))?.detail.product.listed).toBe(true);
  });

  it("rejects missing, deleted, or another seller's product instead of a public fallback", async () => {
    expect(await loadProductPreview("someone-elses-id")).toBeNull();
    mocks.getProducts.mockResolvedValue([{ id: "p1", manufacturerId: "m2" }]);
    expect(await loadProductPreview("p1")).toBeNull();
    mocks.getProducts.mockResolvedValue([]);
    expect(await loadProductPreview("p1")).toBeNull();
    expect(mocks.publicProduct).not.toHaveBeenCalled();
  });

  it("requires supplier authentication before loading any inventory", async () => {
    mocks.requireSupplier.mockRejectedValue(new Error("redirect to manufacturer login"));
    await expect(loadProductPreview("p1")).rejects.toThrow("redirect");
    expect(mocks.getProducts).not.toHaveBeenCalled();
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("propagates service errors rather than disguising them as a missing product", async () => {
    mocks.getProducts.mockRejectedValue(new Error("Inventory unavailable"));
    await expect(loadProductPreview("p1")).rejects.toThrow("Inventory unavailable");
  });

  it("retains the product when optional videos fail", async () => {
    mocks.getSeeks.mockRejectedValue(new Error("Video service unavailable"));
    expect((await loadProductPreview("p1"))?.seekVideos).toEqual([]);
  });

  it("only includes listed videos tagged with the previewed product", async () => {
    mocks.getSeeks.mockResolvedValue([
      { id: "yes", productIds: ["p1"], videoUrl: "/yes.mp4", title: "Factory video" },
      { id: "paused", productIds: ["p1"], videoUrl: "/no.mp4", listed: false },
      { id: "unrelated", productIds: ["p2"], videoUrl: "/other.mp4" },
    ]);
    expect((await loadProductPreview("p1"))?.seekVideos.map((item) => item.id)).toEqual(["yes"]);
  });
});
