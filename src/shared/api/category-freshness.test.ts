import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";
afterEach(() => vi.unstubAllGlobals());
it("fetches a fresh taxonomy for navigation rather than keeping a five-minute copy", async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ data: [] })));
  vi.stubGlobal("fetch", fetch);
  const api = createHttpApi("https://api.example");
  await api.categories.list();
  await api.categories.listRoots();
  for (const [, options] of fetch.mock.calls) {
    expect(options.cache).toBe("no-store");
    expect(options.next).toBeUndefined();
  }
});
