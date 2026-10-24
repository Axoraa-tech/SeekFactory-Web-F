import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import { refreshTokens } from "@/features/auth/auth-tokens";

vi.mock("@/features/auth/auth-tokens", async (original) => ({
  ...await original<typeof import("@/features/auth/auth-tokens")>(),
  refreshTokens: vi.fn().mockResolvedValue({ accessToken: "refreshed-buyer-token" }),
}));

afterEach(() => vi.clearAllMocks());

describe("admin session isolation", () => {
  it.each(["/admin/login", "/admin/dashboard", "/api/admin/login", "/api/admin/analytics"])(
    "%s does not wait on or modify an unrelated buyer session",
    async (path) => {
      const request = new NextRequest(`https://web.example${path}`, {
        headers: { cookie: "admin_token=admin; sf-access-token=expired; sf-refresh-token=buyer-refresh" },
      });
      const response = await middleware(request);
      expect(refreshTokens).not.toHaveBeenCalled();
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    },
  );

  it("still redirects an admin page without its admin cookie", async () => {
    const response = await middleware(new NextRequest("https://web.example/admin/dashboard", {
      headers: { cookie: "sf-refresh-token=buyer-refresh" },
    }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://web.example/admin/login");
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it.each(["/profile", "/factory?tab=products"])("still refreshes the selected session on %s", async (path) => {
    const seller = path.startsWith("/factory");
    const prefix = seller ? "sf-seller" : "sf";
    const response = await middleware(new NextRequest(`https://web.example${path}`, {
      headers: { cookie: `${prefix}-access-token=expired; ${prefix}-refresh-token=refresh` },
    }));
    expect(refreshTokens).toHaveBeenCalledWith("refresh");
    expect(response.cookies.get(`${prefix}-access-token`)?.value).toBe("refreshed-buyer-token");
  });
});
