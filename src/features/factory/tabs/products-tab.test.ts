// @vitest-environment jsdom
import { createElement as h, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductsTab } from "./products-tab";
import type { SellerProduct } from "../types";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/shared/i18n/regional-context", () => ({ useRegionalSettings: () => ({ translateCategory: (name: string) => name }) }));
vi.mock("next/link", () => ({ default: ({ children, href, title }: { children: ReactNode; href: string; title?: string }) => h("a", { href, title }, children) }));
afterEach(cleanup);

it.each(["Active", "Paused"] as const)("links all %s product entry points to the private preview by ID", (status) => {
  const product: SellerProduct = {
    id: "product/id", slug: "old-public-slug", name: "Lathe", imageUrl: "/cover.png", imageUrls: ["/cover.png"],
    category: "Machinery", categoryId: "c1", priceInr: 100, unit: "Set", moq: "1 Set", status,
    stockStatus: "IN_STOCK", viewsCount: 0, inquiriesCount: 0, specs: {}, description: "", createdAt: "Today",
  };
  render(h(ProductsTab, { products: [product], onOpenAddProduct: vi.fn(), onEditProduct: vi.fn(),
    onSetListed: vi.fn(), onSetStock: vi.fn(), onDeleteProduct: vi.fn() }));
  expect(screen.getByRole("link", { name: "common.view" }).getAttribute("title")).toBe("seller.preview.ownerView");
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(3);
  for (const link of links) expect(link.getAttribute("href")).toBe("/factory/products/product%2Fid");
});
