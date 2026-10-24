// @vitest-environment jsdom
import { createElement as h, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Manufacturer } from "@/entities/manufacturer";
import { VerifiedManufacturersSection } from "./verified-manufacturers-section";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string, values?: Record<string, unknown>) => key + (values ? JSON.stringify(values) : "") }));
vi.mock("@/features/subscription", () => ({ SupplierName: ({ name }: { name: string }) => name }));
vi.mock("@/components/reels/supplier-lock-overlay", () => ({ SupplierLockOverlay: ({ children }: { children: ReactNode }) => children }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => h("a", props, children) }));

const factories = Array.from({ length: 280 }, (_, i) => ({ id: `m${i}`, slug: `factory-${i}`, name: `Factory ${i}`, verified: true, country: "China", yearsEstablished: 2000 } as Manufacturer));
const links = () => [...document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
const more = () => screen.getByRole("button", { name: "manufacturers.list.loadMoreManufacturers" });
const toggle = () => screen.getByRole("button", { name: /manufacturers.list.viewAll|common.showLess/ });
afterEach(cleanup);

it("shows the full total while collapsed, reaches all280 in stable24-card batches, and stops exactly at the end", () => {
  render(h(VerifiedManufacturersSection, { manufacturers: factories }));
  expect(screen.getByRole("heading").textContent).toContain("280");
  expect(links()).toHaveLength(4);
  fireEvent.click(toggle());
  expect(links()).toHaveLength(24);
  const first = links();
  fireEvent.click(more());
  expect(links()).toHaveLength(48);
  expect(links().slice(0, 24)).toEqual(first);
  for (let count = 48; count < 280; count += 24) fireEvent.click(more());
  expect(links()).toHaveLength(280);
  expect(new Set(links()).size).toBe(280);
  expect(screen.queryByRole("button", { name: "manufacturers.list.loadMoreManufacturers" })).toBeNull();
  expect(screen.getByText('manufacturers.list.catalogProgress{"count":280,"total":280}')).toBeTruthy();
  fireEvent.click(toggle());
  expect(links()).toHaveLength(4);
  fireEvent.click(toggle());
  expect(links()).toHaveLength(24);
});

it("resets paging when Explore changes its query/category key, including empty and short results", () => {
  const view = render(h(VerifiedManufacturersSection, { key: "all", manufacturers: factories }));
  fireEvent.click(toggle()); fireEvent.click(more());
  view.rerender(h(VerifiedManufacturersSection, { key: "filtered", manufacturers: factories.slice(0, 7) }));
  expect(links()).toHaveLength(4);
  fireEvent.click(toggle());
  expect(links()).toHaveLength(7);
  expect(screen.queryByRole("button", { name: "manufacturers.list.loadMoreManufacturers" })).toBeNull();
  view.rerender(h(VerifiedManufacturersSection, { key: "empty", manufacturers: [] }));
  expect(links()).toHaveLength(0);
  expect(screen.getByRole("heading").textContent).toContain("0");
});
