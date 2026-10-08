import { describe, expect, it } from "vitest";
import { resolveSessionPortal } from "@/features/auth/auth-tokens";

describe("resolveSessionPortal", () => {
  it("uses the supplier session for buyer pages when there is no buyer session", () => {
    expect(resolveSessionPortal("buyer", false, true)).toBe("seller");
  });

  it("keeps an active buyer session separate from the supplier session", () => {
    expect(resolveSessionPortal("buyer", true, true)).toBe("buyer");
  });

  it("never uses a buyer session for seller pages", () => {
    expect(resolveSessionPortal("seller", false, true)).toBe("seller");
  });

  it("keeps guest buyer pages in the buyer context", () => {
    expect(resolveSessionPortal("buyer", false, false)).toBe("buyer");
  });
});
