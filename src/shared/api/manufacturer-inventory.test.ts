import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => vi.unstubAllGlobals());
it("loads the uncapped public manufacturer endpoint without caching or a search limit", async () => {
  const data = Array.from({ length: 280 }, (_, i) => ({ id: String(i), name: `Factory ${i}`, verified: true, categoryIds: ["leaf"] }));
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data })));
  vi.stubGlobal("fetch", fetch);
  const all = await createHttpApi("https://api.example").manufacturers.listAll();
  expect(all).toHaveLength(280);
  expect(all[279]).toMatchObject(data[279]);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe("https://api.example/api/v1/manufacturers");
  expect(fetch.mock.calls[0][1].cache).toBe("no-store");
});
it("rejects an incomplete inventory request rather than showing a capped fallback as a total", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 })));
  await expect(createHttpApi("https://api.example").manufacturers.listAll()).rejects.toThrow("Unavailable");
});
