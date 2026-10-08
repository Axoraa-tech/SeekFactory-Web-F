import { afterEach, describe, expect, it, vi } from "vitest";
import { minimumOrderQuantity } from "@/shared/lib/quantity";
import { formatRelativeTime } from "@/shared/lib/format";
import { buildCategoryTree } from "@/features/categories/category-tree";
import { cookieNames, isExpired, portalForUrl, readTokenPair } from "@/features/auth/auth-tokens";
import { postAuthPath } from "@/features/auth/session-cookie";
import { feedSourceKey } from "@/features/feed/load-feed";
import type { Category } from "@/entities/category";

describe("minimumOrderQuantity", () => {
  it("reads the leading number of a free-text MOQ", () => {
    expect(minimumOrderQuantity("500 pcs")).toBe(500);
    expect(minimumOrderQuantity("1,000 units")).toBe(1000);
    expect(minimumOrderQuantity(12)).toBe(12);
  });

  it("falls back to 1 when there is no usable number", () => {
    expect(minimumOrderQuantity(undefined)).toBe(1);
    expect(minimumOrderQuantity("Negotiable")).toBe(1);
    expect(minimumOrderQuantity("0 sets")).toBe(1);
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => vi.useRealTimers());

  it("formats recent ISO timestamps relatively", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
    expect(formatRelativeTime("2026-09-27T11:59:30Z")).toBe("just now");
    expect(formatRelativeTime("2026-09-27T11:55:00Z")).toBe("5m ago");
    expect(formatRelativeTime("2026-09-27T09:00:00Z")).toBe("3h ago");
    expect(formatRelativeTime("2026-09-25T12:00:00Z")).toBe("2d ago");
  });

  it("passes non-dates through and renders empty input as empty", () => {
    expect(formatRelativeTime("Just now")).toBe("Just now");
    expect(formatRelativeTime("")).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
  });
});

describe("buildCategoryTree", () => {
  const cat = (id: string, name: string, parentId: string | null): Category => ({
    id,
    slug: id.replace("cat-", ""),
    name,
    listingCount: 0,
    parentId,
    icon: "other",
  });

  it("groups children under roots, keyed by id and slug, sorted by name", () => {
    const { roots, childrenByRoot } = buildCategoryTree([
      cat("cat-b", "Beta", null),
      cat("cat-a", "Alpha", null),
      cat("cat-a-2", "Zinc", "cat-a"),
      cat("cat-a-1", "Brass", "cat-a"),
    ]);
    expect(roots.map((r) => r.id)).toEqual(["cat-a", "cat-b"]);
    expect(childrenByRoot["cat-a"].map((c) => c.name)).toEqual(["Brass", "Zinc"]);
    expect(childrenByRoot["a"]).toBe(childrenByRoot["cat-a"]);
    expect(childrenByRoot["cat-b"]).toEqual([]);
  });

  it("puts the catch-all Other category last at both levels", () => {
    const { roots, childrenByRoot } = buildCategoryTree([
      cat("cat-other", "Other", null),
      cat("cat-woodworking", "Woodworking", null),
      cat("cat-agriculture", "Agriculture", null),
      cat("cat-agriculture-other", "Other", "cat-agriculture"),
      cat("cat-agriculture-tractors", "Tractors", "cat-agriculture"),
    ]);
    expect(roots.map((r) => r.name)).toEqual(["Agriculture", "Woodworking", "Other"]);
    expect(childrenByRoot["cat-agriculture"].map((c) => c.name)).toEqual(["Tractors", "Other"]);
  });
});

describe("auth tokens", () => {
  const jwt = (payload: object) =>
    `x.${Buffer.from(JSON.stringify(payload)).toString("base64").replace(/=+$/, "")}.y`;

  it("reads the token pair from an auth response", () => {
    expect(readTokenPair({ data: { accessToken: "a", refreshToken: "r", expiresIn: 60 } })).toEqual({
      accessToken: "a",
      refreshToken: "r",
      expiresIn: 60,
    });
    expect(readTokenPair({ data: {} })).toBeNull();
    expect(readTokenPair(null)).toBeNull();
  });

  it("treats missing, unreadable and nearly expired tokens as expired", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isExpired(undefined)).toBe(true);
    expect(isExpired("not-a-jwt")).toBe(true);
    expect(isExpired(jwt({ exp: now + 30 }))).toBe(true);
    expect(isExpired(jwt({ exp: now + 3600 }))).toBe(false);
  });
});

describe("feedSourceKey", () => {
  it("uses the tab when not filtering and the search otherwise", () => {
    expect(feedSourceKey("following", "", " ")).toBe("tab:following");
    expect(feedSourceKey("for-you", "cat-x", "")).toBe("search:cat-x:");
    expect(feedSourceKey("for-you", "", " lathe ")).toBe("search::lathe");
  });
});

describe("buyer site and seller hub sessions", () => {
  it("uses the seller session only in the seller hub and the manufacturer sign-in pages", () => {
    expect(portalForUrl("/factory")).toBe("seller");
    expect(portalForUrl("/factory/verify")).toBe("seller");
    expect(portalForUrl("/login", new URLSearchParams("role=manufacturer"))).toBe("seller");
    expect(portalForUrl("/join", new URLSearchParams("role=manufacturer"))).toBe("seller");
    expect(portalForUrl("/")).toBe("buyer");
    expect(portalForUrl("/factoryx")).toBe("buyer");
    expect(portalForUrl("/login")).toBe("buyer");
    expect(portalForUrl("/profile", new URLSearchParams("role=manufacturer"))).toBe("buyer");
  });

  it("gives each section its own cookies", () => {
    expect(cookieNames("buyer").access).not.toBe(cookieNames("seller").access);
    expect(cookieNames("buyer").refresh).not.toBe(cookieNames("seller").refresh);
  });

  it("redirects after sign-in by the tab used, keeping `next` only within that section", () => {
    expect(postAuthPath("Buyer", "/profile")).toBe("/profile");
    expect(postAuthPath("Buyer", "/factory")).toBe("/");
    expect(postAuthPath("Supplier", "/profile")).toBe("/factory?tab=products");
    expect(postAuthPath("Supplier", "/factory?tab=rfqs")).toBe("/factory?tab=rfqs");
    expect(postAuthPath("Supplier")).toBe("/factory?tab=products");
    expect(postAuthPath("Buyer", "//evil.example")).toBe("/");
  });
});
