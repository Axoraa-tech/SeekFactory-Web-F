// @vitest-environment jsdom
import { createElement as h, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ExplorePage from "@/app/(buyer)/explore/page";

const mocks = vi.hoisted(() => ({
  listCatalog: vi.fn(async () => Array.from({ length: 634 }, (_, i) => ({ id: `${i}`, slug: `product-${i}`, name: `Product ${i}`, categoryId: "root", description: "Machine", priceInr: i + 1, imageUrl: "", listed: true }))),
  query: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ getApi: () => ({
  products: { listCatalog: mocks.listCatalog }, search: { query: mocks.query },
  manufacturers: { listAll: async () => [] }, categories: { list: async () => [] },
}) }));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string, values?: Record<string, unknown>) => key + (values ? JSON.stringify(values) : "") }));
vi.mock("next/link", () => ({ default: ({ children, prefetch, ...props }: { children: ReactNode; prefetch?: boolean }) => { void prefetch; return h("a", props, children); } }));
vi.mock("@/components/ui/price", () => ({ Price: () => null }));
vi.mock("@/components/products/product-image-carousel", () => ({ ProductImageCarousel: () => null }));
vi.mock("@/features/explore/verified-manufacturers-section", () => ({ VerifiedManufacturersSection: () => null }));
vi.mock("@/features/explore/record-search", () => ({ RecordSearch: () => null }));
vi.mock("@/features/explore/product-sort-menu", () => ({ ProductSortMenu: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("renders the full public total while limiting each page to 24 products", async () => {
  render(await ExplorePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("heading").textContent).toContain("634");
  expect(document.querySelectorAll('a[href^="/products/"]')).toHaveLength(24);
  expect(screen.getByRole("link", { name: "explore.pagination.next" }).getAttribute("href")).toBe("/explore?page=2");
  expect(screen.queryByRole("link", { name: "explore.pagination.previous" })).toBeNull();
  expect(mocks.listCatalog).toHaveBeenCalledTimes(1);
  expect(mocks.query).not.toHaveBeenCalled();
});

it("renders the last page without losing the total or looping to another next page", async () => {
  render(await ExplorePage({ searchParams: Promise.resolve({ page: "27", sort: "newest" }) }));
  expect(screen.getByRole("heading").textContent).toContain("634");
  expect(document.querySelectorAll('a[href^="/products/"]')).toHaveLength(10);
  expect(document.querySelector('a[href="/products/product-624"]')).not.toBeNull();
  expect(screen.queryByRole("link", { name: "explore.pagination.next" })).toBeNull();
  expect(screen.getByRole("link", { name: "explore.pagination.previous" }).getAttribute("href")).toBe("/explore?sort=newest&page=26");
});
