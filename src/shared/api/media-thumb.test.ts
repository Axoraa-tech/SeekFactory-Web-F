import { describe, expect, it } from "vitest";
import { mediaThumb } from "./http-api";

const KEY = "0f8fad5b-d9cb-469f-a165-70867728950e";

describe("mediaThumb", () => {
  it("asks the API for a smaller copy of an uploaded photo", () => {
    expect(mediaThumb(`/api/v1/media/${KEY}.png`, 640)).toMatch(new RegExp(`/api/v1/media/${KEY}\\.png\\?w=640$`));
    expect(mediaThumb(`http://localhost:8080/api/v1/media/${KEY}.jpg`, 160)).toMatch(/\.jpg\?w=160$/);
  });

  it("routes CDN photos through the API, which redirects to the stored copy", () => {
    expect(mediaThumb(`https://media.example.com/media/${KEY}.png`, 1280)).toMatch(new RegExp(`/api/v1/media/${KEY}\\.png\\?w=1280$`));
  });

  it("does not stack size requests", () => {
    expect(mediaThumb(`/api/v1/media/${KEY}.png?w=1280`, 160)).toMatch(/\.png\?w=160$/);
  });

  it("leaves everything else alone", () => {
    for (const url of [
      `/api/v1/media/${KEY}.webp`,
      `/api/v1/media/${KEY}.mp4`,
      "blob:http://localhost:3000/abc",
      "https://images.unsplash.com/photo-1.jpg",
      "/brand/seekfactory-logo.png",
    ]) {
      expect(mediaThumb(url, 640)).toBe(url);
    }
    expect(mediaThumb(undefined, 640)).toBeUndefined();
  });
});
