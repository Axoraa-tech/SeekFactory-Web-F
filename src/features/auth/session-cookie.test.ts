import { describe, expect, it } from "vitest";
import { parseSessionCookie, postAuthPath } from "@/features/auth/session-cookie";

describe("postAuthPath", () => {
  it("allows same-origin relative next paths", () => {
    expect(postAuthPath("Buyer", "/messages")).toBe("/messages");
    expect(postAuthPath("Buyer", "/profile?tab=rfqs")).toBe("/profile?tab=rfqs");
  });

  it("blocks open redirects", () => {
    expect(postAuthPath("Buyer", "//evil.example")).toBe("/");
    expect(postAuthPath("Supplier", "https://evil.example")).toBe("/factory");
    expect(postAuthPath("Buyer", "javascript:alert(1)")).toBe("/");
  });

  it("defaults by role when next is missing", () => {
    expect(postAuthPath("Buyer")).toBe("/");
    expect(postAuthPath("Supplier")).toBe("/factory");
  });
});

describe("parseSessionCookie", () => {
  it("parses a valid payload", () => {
    const raw = encodeURIComponent(
      JSON.stringify({
        id: "user-1",
        name: "Ada",
        role: "Buyer",
        email: "ada@seekfactory.com",
        companyName: "Apex",
      })
    );
    expect(parseSessionCookie(raw)?.id).toBe("user-1");
  });

  it("returns null for invalid JSON", () => {
    expect(parseSessionCookie("not-json")).toBeNull();
    expect(parseSessionCookie(undefined)).toBeNull();
  });
});
