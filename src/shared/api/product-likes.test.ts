import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => vi.unstubAllGlobals());

it("uses the product ID endpoint and returns the persisted mutation response", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { liked: true, likesCount: 12 } })));
  vi.stubGlobal("fetch", fetch);
  expect(await createHttpApi("https://api.example.com").products.toggleLike("product/one"))
    .toEqual({ liked: true, likesCount: 12 });
  expect(fetch.mock.calls[0][0]).toBe("https://api.example.com/api/v1/products/product%2Fone/like");
  expect(fetch.mock.calls[0][1].method).toBe("POST");
});

it("hydrates product counts and viewer state without inventing counts for older responses", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
    { id: "liked", likesCount: 12, likedByMe: true }, { id: "old" },
  ] })));
  vi.stubGlobal("fetch", fetch);
  const products = await createHttpApi("https://api.example.com").products.listByCategory("category");
  expect(products[0]).toMatchObject({ id: "liked", likesCount: 12, likedByMe: true });
  expect(products[1].likesCount).toBeUndefined();
  expect(products[1].likedByMe).toBeUndefined();
});
