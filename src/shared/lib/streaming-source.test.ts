import { describe, expect, it } from "vitest";
import { chooseStreamMode, videoSrcFor } from "./streaming-source";

const HLS = "https://media.example/media/hls/9c052948-f232-4104-8de5-46dad6a5bf6c/master.m3u8";
const MP4 = "https://media.example/media/9c052948-f232-4104-8de5-46dad6a5bf6c.mp4";
const base = { hlsUrl: HLS, enabled: true, nativeHls: false, mediaSource: false, failed: false };

describe("chooseStreamMode", () => {
  it("plays the file when there is no stream, streaming is off, or it already failed", () => {
    expect(chooseStreamMode({ ...base, hlsUrl: undefined, mediaSource: true })).toBe("mp4");
    expect(chooseStreamMode({ ...base, enabled: false, mediaSource: true })).toBe("mp4");
    expect(chooseStreamMode({ ...base, failed: true, nativeHls: true })).toBe("mp4");
  });

  it("prefers hls.js even where the browser plays HLS itself (Chrome, Safari)", () => {
    expect(chooseStreamMode({ ...base, nativeHls: true, mediaSource: true })).toBe("hlsjs");
  });

  it("uses the browser's own player where there is no Media Source (older iPhones)", () => {
    expect(chooseStreamMode({ ...base, nativeHls: true })).toBe("native-hls");
  });

  it("uses hls.js where Media Source Extensions exist", () => {
    expect(chooseStreamMode({ ...base, mediaSource: true })).toBe("hlsjs");
  });

  it("falls back to the file on browsers with neither", () => {
    expect(chooseStreamMode(base)).toBe("mp4");
  });
});

describe("videoSrcFor", () => {
  const urls = { hlsUrl: HLS, videoUrl: MP4 };

  it("gives the element the right address per mode", () => {
    expect(videoSrcFor("mp4", { ...urls, attached: true })).toBe(MP4);
    expect(videoSrcFor("native-hls", { ...urls, attached: true })).toBe(HLS);
    // hls.js feeds the element itself
    expect(videoSrcFor("hlsjs", { ...urls, attached: true })).toBeUndefined();
  });

  it("holds nothing while the card has let go of its media or the mode is not decided yet", () => {
    expect(videoSrcFor("mp4", { ...urls, attached: false })).toBeUndefined();
    expect(videoSrcFor("native-hls", { ...urls, attached: false })).toBeUndefined();
    expect(videoSrcFor(null, { ...urls, attached: true })).toBeUndefined();
  });
});
