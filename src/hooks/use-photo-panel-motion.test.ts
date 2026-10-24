// @vitest-environment jsdom
import { createElement as h } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { usePhotoPanelMotion } from "./use-photo-panel-motion";

let reduced = false;
let hovered = false;
const scroll = vi.fn();
function Panel({ horizontal = false, hasMore = true }: { horizontal?: boolean; hasMore?: boolean }) {
  const motion = usePhotoPanelMotion(horizontal, 3, hasMore);
  return h("div", { ref: motion.ref, "data-testid": "panel" },
    h("button", { onClick: motion.togglePaused }, "Pause"),
    ...[0, 1, 2].map((i) => h("article", { key: i }, h("button", null, `Product ${i}`))));
}
function setup(horizontal = false, hasMore = true) {
  const view = render(h(Panel, { horizontal, hasMore }));
  const root = screen.getByTestId("panel");
  root.scrollTo = scroll;
  Object.defineProperties(root, {
    clientWidth: { value: 300 }, clientHeight: { value: 300 },
    scrollWidth: { value: 900 }, scrollHeight: { value: 900 },
  });
  vi.spyOn(root, "matches").mockImplementation(() => hovered);
  vi.spyOn(root, "getBoundingClientRect").mockImplementation(() => ({ left: 0, top: 0, width: 300, height: 300, bottom: 300, right: 300, x: 0, y: 0, toJSON() {} }));
  root.querySelectorAll("article").forEach((card, i) => {
    vi.spyOn(card, "getBoundingClientRect").mockImplementation(() => ({ left: i * 300 - root.scrollLeft, top: i * 300 - root.scrollTop, width: 300, height: 300, bottom: 300, right: 300, x: 0, y: 0, toJSON() {} }));
  });
  return { root, ...view };
}
const tick = () => act(() => { vi.advanceTimersByTime(3500); });
beforeEach(() => {
  vi.useFakeTimers(); reduced = false; hovered = false; scroll.mockReset();
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ get matches() { return reduced; } }) });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("advances vertically from the manual position without adding catalogue pages", () => {
  const { root } = setup();
  root.scrollTop = 120;
  tick();
  expect(scroll).toHaveBeenCalledWith({ top: 300, behavior: "smooth" });
  root.scrollTop = 600;
  scroll.mockClear(); tick();
  expect(scroll).not.toHaveBeenCalled();
});
it("supports the horizontal strip and wraps only after the complete catalogue", () => {
  const { root } = setup(true, false);
  tick();
  expect(scroll).toHaveBeenLastCalledWith({ left: 300, behavior: "smooth" });
  root.scrollLeft = 600; tick();
  expect(scroll).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
});
it("pauses for hover, keyboard focus, reduced motion, held pointers and active dialogs", () => {
  const { root } = setup();
  hovered = true; tick(); hovered = false;
  const button = screen.getByRole("button", { name: "Product 0" });
  button.focus(); tick(); button.blur();
  reduced = true; tick(); reduced = false;
  fireEvent.pointerDown(root); tick(); fireEvent.pointerUp(window);
  root.querySelector("article")!.setAttribute("data-photo-interaction", "true"); tick();
  expect(scroll).not.toHaveBeenCalled();
  root.querySelector("article")!.removeAttribute("data-photo-interaction"); tick();
  expect(scroll).toHaveBeenCalledTimes(1);
});
it("waits after wheel input, honors explicit pause and cleans up timers on unmount", () => {
  const { root, unmount } = setup();
  act(() => { vi.advanceTimersByTime(1000); });
  fireEvent.wheel(root); act(() => { vi.advanceTimersByTime(2500); });
  expect(scroll).not.toHaveBeenCalled();
  tick(); expect(scroll).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  tick(); expect(scroll).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  tick(); expect(scroll).toHaveBeenCalledTimes(2);
  unmount(); tick(); expect(scroll).toHaveBeenCalledTimes(2);
});
