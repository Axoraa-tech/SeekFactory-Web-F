import { describe, expect, it } from "vitest";
import { mediaLoadFor, pickNext } from "./media-window";

describe("mediaLoadFor", () => {
  it("buffers the first seek and the one on screen", () => {
    expect(mediaLoadFor({ zone: null, first: true })).toEqual({ preload: "auto", attached: true, buffer: "watching" });
    expect(mediaLoadFor({ zone: "visible" })).toEqual({ preload: "auto", attached: true, buffer: "watching" });
  });

  it("buffers only the next upcoming card; other near cards fetch metadata", () => {
    expect(mediaLoadFor({ zone: "near", isNext: true })).toEqual({ preload: "auto", attached: true, buffer: "upNext" });
    expect(mediaLoadFor({ zone: "near" }).preload).toBe("metadata");
  });

  it("keeps cards a few screens away idle but attached", () => {
    expect(mediaLoadFor({ zone: "mid" })).toEqual({ preload: "none", attached: true, buffer: "upNext" });
    expect(mediaLoadFor({ zone: null, eager: true })).toEqual({ preload: "metadata", attached: true, buffer: "upNext" });
  });

  it("drops the source of far cards, even the first one", () => {
    expect(mediaLoadFor({ zone: "far" })).toEqual({ preload: "none", attached: false, buffer: "upNext" });
    expect(mediaLoadFor({ zone: "far", first: true }).attached).toBe(false);
  });
});

describe("buffer roles", () => {
  it("lets only the seek being watched buffer far ahead", () => {
    // The first seek, scrolled past but still near: keeps its start, yields the bandwidth
    expect(mediaLoadFor({ zone: "near", first: true })).toEqual({ preload: "auto", attached: true, buffer: "upNext" });
    expect(mediaLoadFor({ zone: "visible", first: true }).buffer).toBe("watching");
  });
});

describe("pickNext", () => {
  it("picks the closest card starting below the screen", () => {
    expect(pickNext([["a", 1200], ["b", 900], ["c", 300]], 800)).toBe("b");
    expect(pickNext([["c", 300]], 800)).toBeNull();
    expect(pickNext([], 800)).toBeNull();
  });
});

import { posterFor } from "./media-window";
describe("posterFor", () => {
  it("gives a poster only to cards near the screen", () => {
    expect(posterFor("p.jpg", { preload: "auto", attached: true, buffer: "upNext" })).toBe("p.jpg");
    expect(posterFor("p.jpg", { preload: "metadata", attached: true, buffer: "upNext" })).toBe("p.jpg");
    expect(posterFor("p.jpg", { preload: "none", attached: true, buffer: "upNext" })).toBeUndefined();
    expect(posterFor("p.jpg", { preload: "none", attached: false, buffer: "upNext" })).toBeUndefined();
  });
});
