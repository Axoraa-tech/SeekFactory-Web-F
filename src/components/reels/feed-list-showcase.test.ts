// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedListShowcase } from "./feed-list-showcase";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

vi.mock("./showcase-parts", () => ({
  EmptyShowcase: () => null, FactoryLine: () => null, Hashtags: () => null,
  Poster: () => null, SeekActions: () => null, Stats: () => null,
}));
vi.mock("@/shared/api/http-api", () => ({ mediaThumb: (url: string) => url }));
let notify: IntersectionObserverCallback;
const disconnect = vi.fn();
const observe = vi.fn();
const play = vi.fn(function (this: HTMLVideoElement) { this.dataset.playing = "true"; return Promise.resolve(); });
const pause = vi.fn(function (this: HTMLVideoElement) { this.dataset.playing = "false"; });
const items = ["one", "two"].map((id) => ({ reel: { id, title: id, videoUrl: `/${id}.mp4` } })) as FeedItem[];
const settings = { autoplay: true, showProfile: false, showPhotos: false } as FeedShowcase;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = observe; disconnect = disconnect;
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function change(container: HTMLElement, id: string, ratio: number) {
  act(() => notify([{ target: container.querySelector(`[data-reel-id="${id}"]`)!, isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver));
}
function playing(container: HTMLElement) {
  return [...container.querySelectorAll("video")].filter((v) => v.dataset.playing === "true").map((v) => v.getAttribute("src"));
}
describe("feed autoplay bandwidth", () => {
  it("pauses the last video after it leaves the viewport", () => {
    const { container } = render(createElement(FeedListShowcase, { items, settings }));
    change(container, "one", 0.75); expect(playing(container)).toEqual(["/one.mp4"]);
    change(container, "one", 0); expect(playing(container)).toEqual([]);
  });
  it("retains unchanged visible entries and switches only to the most visible video", () => {
    const { container } = render(createElement(FeedListShowcase, { items, settings }));
    change(container, "one", 1); change(container, "two", 0.5);
    expect(playing(container)).toEqual(["/one.mp4"]);
    change(container, "one", 0.25); expect(playing(container)).toEqual(["/two.mp4"]);
    change(container, "two", 0.25); expect(playing(container)).toEqual([]);
  });
  it("pauses while the tab is hidden and resumes only the visible video", () => {
    const { container } = render(createElement(FeedListShowcase, { items, settings }));
    change(container, "one", 1);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(playing(container)).toEqual([]);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(playing(container)).toEqual(["/one.mp4"]);
  });
  it("stops autoplay when disabled, and disconnects observers on teardown", () => {
    const { container, rerender, unmount } = render(createElement(FeedListShowcase, { items, settings }));
    change(container, "one", 1);
    rerender(createElement(FeedListShowcase, { items, settings: { ...settings, autoplay: false } }));
    expect(playing(container)).toEqual([]); expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
  });
  it("works without IntersectionObserver and keeps offscreen preload disabled", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(createElement(FeedListShowcase, { items, settings }));
    expect(playing(container)).toEqual([]);
    expect(container.querySelectorAll("video")[1].preload).toBe("none");
  });
});
