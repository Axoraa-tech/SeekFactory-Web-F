// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => {
  vi.unstubAllGlobals();
  for (const name of ["sf-session", "sf-seller-session"]) document.cookie = `${name}=; Max-Age=0; Path=/`;
});

describe("login request waterfall", () => {
  it.each(["Buyer", "Supplier"] as const)("%s login finishes from one auth response without waiting on /me", async (role) => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {
      userId: "test-user", name: "Test", role, email: "test@example.invalid", firstLogin: true,
    } })));
    vi.stubGlobal("fetch", fetch);
    const profile = await createHttpApi("https://api.example").session.login({ role, method: "email", email: "test@example.invalid", password: "test-password" });
    expect(profile).toMatchObject({ id: "test-user", role, firstLogin: true });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe("/api/proxy/api/v1/auth/login");
    expect(fetch.mock.calls[0][1].headers["x-sf-portal"]).toBe(role === "Supplier" ? "seller" : "buyer");
    expect(document.cookie).toContain(role === "Supplier" ? "sf-seller-session=" : "sf-session=");
  });

  it("does not retry rejected credentials or create a display session", async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 })));
    vi.stubGlobal("fetch", fetch);
    const api = createHttpApi("https://api.example");
    await expect(api.session.login({ role: "Buyer", method: "email", email: "test@example.invalid", password: "wrong" })).rejects.toThrow("Invalid credentials");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.cookie).not.toContain("sf-session=");
  });

  it("Google login preserves the first-login result without another profile request", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { userId: "buyer", role: "Buyer", firstLogin: true } })));
    vi.stubGlobal("fetch", fetch);
    expect(await createHttpApi("https://api.example").session.loginWithGoogle("test-id-token")).toMatchObject({ id: "buyer", firstLogin: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
