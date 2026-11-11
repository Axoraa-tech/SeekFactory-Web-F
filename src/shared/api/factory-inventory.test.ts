import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => vi.unstubAllGlobals());

it("keeps inventory failures distinct from a genuinely empty factory", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 })));
  await expect(createHttpApi("https://api.example").factory.getProducts()).rejects.toThrow("Unavailable");
});

it("accepts an empty inventory and requests it without caching private data", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] })));
  vi.stubGlobal("fetch", fetch);
  expect(await createHttpApi("https://api.example").factory.getProducts()).toEqual([]);
  expect(fetch.mock.calls[0][0]).toBe("https://api.example/api/v1/factory/products");
  expect(fetch.mock.calls[0][1].cache).toBe("no-store");
});
