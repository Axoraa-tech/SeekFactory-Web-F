// @vitest-environment jsdom
import { createElement as h, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SalesproTopbar } from "./salespro-topbar";
import type { SellerFactoryProfile } from "../types";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/components/layout/language-currency-dropdown", () => ({ LanguageCurrencyDropdown: () => null }));
vi.mock("next/link", () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => h("a", { href }, children) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const profile: SellerFactoryProfile = {
  name: "Factory", slug: "factory--123456", logoUrl: "", coverUrl: "", country: "China", location: "",
  yearsEstablished: 0, factorySize: "", employees: "", exportCountries: [], certifications: [],
  description: "", productionLines: 0, verified: true, tier: "",
};
function mount(overrides: Partial<SellerFactoryProfile> = {}) {
  return render(h(SalesproTopbar, { activeTab: "products", profile: { ...profile, ...overrides },
    onOpenAddProduct: vi.fn(), onOpenAddSeek: vi.fn() }));
}
it.each([{ verified: false }, { slug: "" }, { slug: "   " }])("prevents public navigation and sharing when unavailable: %o", (state) => {
  const share = vi.fn();
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  mount(state);
  expect(screen.queryByRole("link", { name: "seller.top.publicProfile" })).toBeNull();
  expect((screen.getByRole("button", { name: "seller.top.publicProfile" }) as HTMLButtonElement).disabled).toBe(true);
  const button = screen.getByRole("button", { name: "common.share" }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(button);
  expect(share).not.toHaveBeenCalled();
  expect(screen.getByRole("status").textContent).toBe("seller.top.publicProfileUnavailable");
});
it("shares the approved public URL using native share", async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  mount();
  expect(screen.getByRole("link", { name: "seller.top.publicProfile" }).getAttribute("href")).toBe("/manufacturers/factory--123456");
  fireEvent.click(screen.getByRole("button", { name: "common.share" }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({
    title: "Factory", text: "Factory on SeekFactory", url: window.location.origin + "/manufacturers/factory--123456",
  }));
});
it("copies the approved public URL without native share", async () => {
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole("button", { name: "common.share" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "seller.top.linkCopied" })).toBeTruthy());
  expect(writeText).toHaveBeenCalledWith(window.location.origin + "/manufacturers/factory--123456");
});
it("disables the controls again if approval is withdrawn", () => {
  const view = mount();
  view.rerender(h(SalesproTopbar, { activeTab: "products", profile: { ...profile, verified: false },
    onOpenAddProduct: vi.fn(), onOpenAddSeek: vi.fn() }));
  expect(screen.queryByRole("link", { name: "seller.top.publicProfile" })).toBeNull();
  expect((screen.getByRole("button", { name: "common.share" }) as HTMLButtonElement).disabled).toBe(true);
});
