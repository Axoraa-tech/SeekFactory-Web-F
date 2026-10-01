import { afterEach, describe, expect, it, vi } from "vitest";

const KEY = "11111111-1111-1111-1111-111111111111.mp4";

async function load(env: { api?: string; cdn?: string }) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", env.api ?? "");
  vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE_URL", env.cdn ?? "");
  return import("./http-api");
}

describe("media URLs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads uploads from the CDN when one is configured", async () => {
    const { resolveMediaUrl, toStoredMediaUrl } = await load({
      api: "https://api.example.com",
      cdn: "https://media.example.com/",
    });
    expect(resolveMediaUrl(`/api/v1/media/${KEY}`)).toBe(`https://media.example.com/media/${KEY}`);
    expect(toStoredMediaUrl(`https://media.example.com/media/${KEY}`)).toBe(`/api/v1/media/${KEY}`);
    // Links resolved before the switch still map back
    expect(toStoredMediaUrl(`https://api.example.com/api/v1/media/${KEY}`)).toBe(`/api/v1/media/${KEY}`);
  });

  it("falls back to the API origin without a CDN", async () => {
    const { resolveMediaUrl, toStoredMediaUrl } = await load({ api: "https://api.example.com" });
    expect(resolveMediaUrl(`/api/v1/media/${KEY}`)).toBe(`https://api.example.com/api/v1/media/${KEY}`);
    expect(toStoredMediaUrl(`https://api.example.com/api/v1/media/${KEY}`)).toBe(`/api/v1/media/${KEY}`);
  });

  it("leaves frontend assets and external links alone", async () => {
    const { resolveMediaUrl } = await load({ cdn: "https://media.example.com" });
    expect(resolveMediaUrl("/videos/demo.mp4")).toBe("/videos/demo.mp4");
    expect(resolveMediaUrl("https://elsewhere.example.com/a.jpg")).toBe("https://elsewhere.example.com/a.jpg");
    expect(resolveMediaUrl(undefined)).toBeUndefined();
  });
});
