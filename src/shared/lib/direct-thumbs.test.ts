// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { apiThumbFor, directThumbUrl, thumbFallbackScript } from "./direct-thumbs";

const ID = "0f8fad5b-d9cb-469f-a165-70867728950e";
const PREFIX = "https://store.example/media/media/";

describe("direct thumbnails", () => {
  it("builds the storage name the backend keeps every thumbnail under", () => {
    expect(directThumbUrl(PREFIX, `${ID}.png`, 640)).toBe(`${PREFIX}variants/${ID}-w640.png`);
    expect(directThumbUrl(PREFIX, `${ID}.jpg`, 160)).toBe(`${PREFIX}variants/${ID}-w160.jpg`);
  });

  it("maps a missing direct thumbnail back to the API, which makes it", () => {
    expect(apiThumbFor(`${PREFIX}variants/${ID}-w1280.png`, "https://api.example"))
      .toBe(`https://api.example/api/v1/media/${ID}.png?w=1280`);
    expect(apiThumbFor(`${PREFIX}${ID}.png`, "https://api.example")).toBeNull();
    expect(apiThumbFor(`${PREFIX}variants/${ID}-w500.png`, "https://api.example")).toBeNull();
  });

  it("swaps a failed <img> to the API address once", () => {
    document.body.innerHTML = "";
    new Function(thumbFallbackScript("https://api.example"))();
    const img = document.createElement("img");
    img.src = `${PREFIX}variants/${ID}-w640.png`;
    document.body.appendChild(img);
    img.dispatchEvent(new Event("error"));
    expect(img.src).toBe(`https://api.example/api/v1/media/${ID}.png?w=640`);
    expect(img.dataset.thumbFallback).toBe("1");
    // Other images are left alone
    const other = document.createElement("img");
    other.src = "https://example.com/x.png";
    document.body.appendChild(other);
    other.dispatchEvent(new Event("error"));
    expect(other.src).toBe("https://example.com/x.png");
  });
});
