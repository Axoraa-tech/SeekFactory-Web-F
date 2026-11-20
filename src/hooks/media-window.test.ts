import { describe, expect, it } from "vitest";
import { mediaLoadFor, pickNext } from "./media-window";

describe("mediaLoadFor", () => {
  it("buffers the first seek and the one on screen", () => {
    expect(mediaLoadFor({ zone: null, first: true })).toEqual({ preload: "auto", attached: true });
    expect(mediaLoadFor({ zone: "visible" })).toEqual({ preload: "auto", attached: true });
  });

  it("buffers only the next upcoming card; other near cards fetch metadata", () => {
    expect(mediaLoadFor({ zone: "near", isNext: true }).preload).toBe("auto");
    expect(mediaLoadFor({ zone: "near" }).preload).toBe("metadata");
  });

  it("keeps cards a few screens away idle but attached", () => {
    expect(mediaLoadFor({ zone: "mid" })).toEqual({ preload: "none", attached: true });
    expect(mediaLoadFor({ zone: null, eager: true })).toEqual({ preload: "metadata", attached: true });
  });

  it("drops the source of far cards, even the first one", () => {
    expect(mediaLoadFor({ zone: "far" })).toEqual({ preload: "none", attached: false });
    expect(mediaLoadFor({ zone: "far", first: true }).attached).toBe(false);
  });
});

describe("pickNext", () => {
  it("picks the closest card starting below the screen", () => {
    expect(pickNext([["a", 1200], ["b", 900], ["c", 300]], 800)).toBe("b");
    expect(pickNext([["c", 300]], 800)).toBeNull();
    expect(pickNext([], 800)).toBeNull();
  });
});
