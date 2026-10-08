import { describe, expect, it } from "vitest";
import { parseSellerTab, SELLER_TABS } from "@/features/factory/types";

describe("seller dashboard tabs", () => {
  it("opens the combined settings page for legacy account links", () => {
    expect(parseSellerTab("account")).toBe("profile");
    expect([...SELLER_TABS]).not.toContain("account");
  });

  it("falls back to the overview for unknown tabs", () => {
    expect(parseSellerTab("unknown")).toBe("overview");
    expect(parseSellerTab(null)).toBe("overview");
  });
});
