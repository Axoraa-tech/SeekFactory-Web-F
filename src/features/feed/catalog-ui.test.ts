// @vitest-environment jsdom
import { createElement as h, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogSnapshotProvider } from "./catalog-snapshot-provider";
import { useRecommendedProducts } from "./use-recommended-products";
import { RecommendedProductsPanel } from "@/components/reels/recommended-products-panel";

const mocks = vi.hoisted(() => ({ viewer: "", api: { categories: { list: vi.fn() }, products: { listByCategory: vi.fn() }, manufacturers: { listAll: vi.fn() } } }));
vi.mock("@/shared/api", () => ({ getApi: () => mocks.api }));
vi.mock("@/features/auth/session-cookie", () => ({ readBrowserCookie: () => mocks.viewer ? { id: mocks.viewer } : null }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/shared/i18n/regional-context", () => ({ useRegionalSettings: () => ({ t: (key: string, args?: unknown) => key + (args && typeof args === "object" ? JSON.stringify(args) : ""), formatPrice: () => "100", translateUnit: (unit: string) => unit }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => h("a", props, children) }));
vi.mock("@/features/subscription", () => ({ SupplierName: ({ name }: { name: string }) => name }));
vi.mock("@/components/reels/supplier-lock-overlay", () => ({ SupplierLockOverlay: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/products/product-image-carousel", () => ({ ProductImageCarousel: () => null }));
vi.mock("@/features/orders/add-to-cart-modal", () => ({ AddToCartModal: () => null }));

const products = Array.from({ length: 634 }, (_, i) => ({ id: `p${i}`, slug: `product-${i}`, name: `Product ${i}`, description: "machine", categoryId: `c${i % 20}`, manufacturerId: "m", imageUrl: "/image.svg", priceInr: 100, unit: "piece", listed: true }));
function Panel({ variant = "column", query = "" }: { variant?: "column" | "strip"; query?: string }) {
  const recommended = useRecommendedProducts(query);
  return h(RecommendedProductsPanel, { variant, recommended });
}
function Browse({ viewer = "", enabled = true, showPhotos = true, variant = "column", query = "" }: { viewer?: string; enabled?: boolean; showPhotos?: boolean; variant?: "column" | "strip"; query?: string }) {
  return h(CatalogSnapshotProvider, { key: viewer || "guest", enabled, children: showPhotos ? h(Panel, { variant, query }) : null });
}
const button = () => screen.getByRole("button", { name: "showcase.single.loadMoreProducts" });
const ids = () => [...document.querySelectorAll("article")].map((article) => article.querySelector("a")?.getAttribute("href"));

beforeEach(() => {
  mocks.viewer = "";
  mocks.api.categories.list.mockReset().mockResolvedValue(Array.from({ length: 20 }, (_, i) => ({ id: `c${i}`, slug: `c${i}`, parentId: null })));
  mocks.api.manufacturers.listAll.mockReset().mockResolvedValue([{ id: "m", slug: "m", name: "Factory", verified: true }]);
  mocks.api.products.listByCategory.mockReset().mockImplementation(async (id: string) => products.filter((p) => p.categoryId === id));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("catalog photo panel", () => {
  it("shares a product from a separate button without following its card link", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(h(Browse));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
    const control = screen.getAllByRole("button", { name: "showcase.single.shareProduct" })[0];
    expect(control.closest("a")).toBeNull();
    const href = control.closest("article")!.querySelector("a")!.getAttribute("href");
    fireEvent.click(control);
    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: expect.any(String), url: `${window.location.origin}${href}` }));
    await waitFor(() => expect(screen.getByText("showcase.single.productShared")).toBeTruthy());
  });
  it("reaches all634 unique products in stable24-card pages and survives LINE/SIDE variant changes", async () => {
    const view = render(h(Browse));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
    const first = ids();
    fireEvent.click(button());
    expect(ids()).toHaveLength(48);
    expect(ids().slice(0, 24)).toEqual(first);
    view.rerender(h(Browse, { variant: "strip" }));
    expect(ids()).toHaveLength(48);
    expect(ids().slice(0, 24)).toEqual(first);
    for (let i = 48; i < 634; i += 24) fireEvent.click(screen.getByText("showcase.single.loadMoreProducts"));
    expect(ids()).toHaveLength(634);
    expect(new Set(ids()).size).toBe(634);
    expect(screen.getByText("showcase.single.catalogComplete")).toBeTruthy();
    expect(mocks.api.categories.list).toHaveBeenCalledTimes(1);
    expect(mocks.api.products.listByCategory).toHaveBeenCalledTimes(20);
  }, 30_000);
  it("shows a complete-catalog error and retry even with photos turned off", async () => {
    mocks.api.products.listByCategory.mockRejectedValueOnce(new Error("one partition offline"));
    render(h(Browse, { showPhotos: false }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText("showcase.single.catalogComplete")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "showcase.single.tryAgain" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
  it("loads nothing when disabled and resets client pages when the query changes", async () => {
    const view = render(h(Browse, { enabled: false }));
    expect(mocks.api.categories.list).not.toHaveBeenCalled();
    view.rerender(h(Browse, { enabled: true }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
    fireEvent.click(button());
    view.rerender(h(Browse, { query: "Product 6" }));
    expect(screen.getAllByRole("article")).toHaveLength(24);
    expect(mocks.api.categories.list).toHaveBeenCalledTimes(1);
  });
  it("clears a ready snapshot immediately when server-verified viewer identity changes", async () => {
    mocks.viewer = "first";
    const view = render(h(Browse, { viewer: "first" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
    let resolve!: (data: typeof products) => void;
    mocks.api.products.listByCategory.mockImplementation(() => new Promise((r) => { resolve = r; }));
    mocks.viewer = "second";
    view.rerender(h(Browse, { viewer: "second" }));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByRole("status")).toBeTruthy();
    // Old promises are cancelled by unmount; no old cards carry over into the next viewer.
    await act(async () => { resolve?.([]); });
  });
  it("times out a stalled full catalog visibly instead of waiting forever", async () => {
    vi.useFakeTimers();
    mocks.api.categories.list.mockImplementation(() => new Promise(() => {}));
    render(h(Browse, { showPhotos: false }));
    await act(async () => { vi.advanceTimersByTime(45_001); });
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
