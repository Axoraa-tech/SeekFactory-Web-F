import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => vi.unstubAllGlobals());

describe("HTTP video feed pages", () => {
  it("requests explicit offsets and a backend-safe page size", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const api = createHttpApi("https://api.example.com");
    await api.feed.listPage("for-you", 2, 50);
    expect(String(fetch.mock.calls[0][0])).toContain("/api/v1/feed?tab=for-you&page=2&size=50");
  });

  it("preserves the Following tab and sanitizes page bounds", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    await createHttpApi("https://api.example.com").feed.listPage("following", -3, 500);
    expect(String(fetch.mock.calls[0][0])).toContain("tab=following&page=0&size=50");
  });

  it("keeps list() as the explicit first-page call", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    await createHttpApi("https://api.example.com").feed.list("for-you");
    expect(String(fetch.mock.calls[0][0])).toContain("page=0&size=50");
  });
});
