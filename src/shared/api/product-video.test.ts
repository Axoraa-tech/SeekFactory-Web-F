import { afterEach, expect, it, vi } from "vitest";
import { toSellerProduct } from "@/features/factory/mappers";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("round-trips product video URLs through create, update, inventory, and seller mapping", async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example");
  vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE_URL", "https://media.example");
  const { createHttpApi } = await import("./http-api");
  const path = "/api/v1/media/11111111-1111-1111-1111-111111111111.mp4";
  const displayed = "https://media.example/media/11111111-1111-1111-1111-111111111111.mp4";
  const stored = { id: "p1", videoUrl: path };
  const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ data: stored }))));
  vi.stubGlobal("fetch", fetch);
  const api = createHttpApi("https://api.example");
  const created = await api.factory.addProduct({ name: "Lathe", categoryId: "c1", imageUrl: "/cover.png", priceInr: 100, videoUrl: displayed });
  expect(JSON.parse(fetch.mock.calls[0][1].body).videoUrl).toBe(path);
  expect(created.videoUrl).toBe(displayed);
  expect(toSellerProduct(created, []).videoUrl).toBe(displayed);
  await api.factory.updateProduct("p1", { videoUrl: displayed });
  expect(JSON.parse(fetch.mock.calls[1][1].body).videoUrl).toBe(path);
  await api.factory.updateProduct("p1", { videoUrl: "" });
  expect(JSON.parse(fetch.mock.calls[2][1].body).videoUrl).toBe("");
  await api.factory.updateProduct("p1", { name: "Changed" });
  expect(JSON.parse(fetch.mock.calls[3][1].body)).not.toHaveProperty("videoUrl");
  fetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ data: [stored, { id: "legacy" }] }))));
  const products = await api.factory.getProducts();
  expect(products[0].videoUrl).toBe(displayed);
  expect(products[1].videoUrl).toBeUndefined();
});
