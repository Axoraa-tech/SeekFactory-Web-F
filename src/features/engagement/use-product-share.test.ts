// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useProductShare } from "./use-product-share";

const native = vi.fn();
const copy = vi.fn();
beforeEach(() => {
  native.mockReset().mockResolvedValue(undefined);
  copy.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { configurable: true, value: native });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: copy } });
});
afterEach(cleanup);

it("shares the product link, suppresses rapid duplicate clicks, and releases after completion", async () => {
  let resolve!: () => void;
  native.mockReturnValueOnce(new Promise<void>((done) => { resolve = done; }));
  const { result } = renderHook(() => useProductShare("machine-1", "Machine"));
  act(() => { void result.current.share(); void result.current.share(); });
  expect(native).toHaveBeenCalledTimes(1);
  expect(native).toHaveBeenCalledWith({ title: "Machine", url: `${window.location.origin}/products/machine-1` });
  expect(result.current.pending).toBe(true);
  await act(async () => { resolve(); });
  expect(result.current.status).toBe("shared");
  expect(result.current.pending).toBe(false);
  await act(async () => { await result.current.share(); });
  expect(native).toHaveBeenCalledTimes(2);
});

it("uses clipboard fallback and allows retry after clipboard failure", async () => {
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  copy.mockRejectedValueOnce(new Error("Clipboard blocked"));
  const { result } = renderHook(() => useProductShare("machine-1", "Machine"));
  await act(async () => { await result.current.share(); });
  expect(result.current.status).toBe("error");
  expect(result.current.pending).toBe(false);
  await act(async () => { await result.current.share(); });
  expect(copy).toHaveBeenLastCalledWith(`${window.location.origin}/products/machine-1`);
  expect(result.current.status).toBe("shared");
});

it("treats native cancellation as idle, and reports other native errors", async () => {
  native.mockRejectedValueOnce(new DOMException("Cancelled", "AbortError")).mockRejectedValueOnce(new Error("Unavailable"));
  const { result } = renderHook(() => useProductShare("machine-1", "Machine"));
  await act(async () => { await result.current.share(); });
  expect(result.current.status).toBe("idle");
  expect(copy).not.toHaveBeenCalled();
  await act(async () => { await result.current.share(); });
  expect(result.current.status).toBe("error");
});
