// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api/http-api";
import type { Product } from "@/entities/product";
import { useProductLikes } from "./use-product-likes";

const mock = vi.hoisted(() => ({ like: vi.fn(), signIn: vi.fn(), viewer: "first" }));
vi.mock("@/shared/api", () => ({ getApi: () => ({ products: { toggleLike: mock.like } }) }));
vi.mock("./use-engagement", () => ({ useRequireSignIn: () => mock.signIn }));
vi.mock("@/features/auth/session-cookie", () => ({ readBrowserCookie: () => ({ id: mock.viewer }) }));
const product = { id: "p1", likesCount: 5, likedByMe: false } as Product;
beforeEach(() => { mock.like.mockReset(); mock.signIn.mockReset(); mock.viewer = "first"; });
afterEach(cleanup);

it("starts from persisted state, optimistically toggles, and uses the server count", async () => {
  mock.like.mockResolvedValueOnce({ liked: true, likesCount: 9 }).mockResolvedValueOnce({ liked: false, likesCount: 8 });
  const { result } = renderHook(() => useProductLikes("snapshot"));
  expect(result.current.getState(product)).toMatchObject({ liked: false, likes: 5 });
  await act(async () => { await result.current.toggleLike(product); });
  expect(result.current.getState(product)).toMatchObject({ liked: true, likes: 9, pending: false });
  await act(async () => { await result.current.toggleLike(product); });
  expect(result.current.getState(product)).toMatchObject({ liked: false, likes: 8 });
  expect(mock.like).toHaveBeenCalledWith("p1");
});

it("suppresses same-tick duplicate clicks and rolls back a failed request for retry", async () => {
  let reject!: (error: Error) => void;
  mock.like.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; })).mockResolvedValueOnce({ liked: true, likesCount: 6 });
  const { result } = renderHook(() => useProductLikes("snapshot"));
  act(() => { void result.current.toggleLike(product); void result.current.toggleLike(product); });
  expect(mock.like).toHaveBeenCalledTimes(1);
  expect(result.current.getState(product)).toMatchObject({ liked: true, likes: 6, pending: true });
  await act(async () => { reject(new Error("Offline")); });
  expect(result.current.getState(product)).toMatchObject({ liked: false, likes: 5, pending: false, error: true });
  await act(async () => { await result.current.toggleLike(product); });
  expect(result.current.getState(product)).toMatchObject({ liked: true, likes: 6, error: false });
});

it("rolls back and uses the existing sign-in gate after a 401", async () => {
  mock.like.mockRejectedValue(new ApiError("Sign in", 401));
  const { result } = renderHook(() => useProductLikes("snapshot"));
  await act(async () => { await result.current.toggleLike(product); });
  expect(result.current.getState(product)).toMatchObject({ liked: false, likes: 5, error: true });
  expect(mock.signIn).toHaveBeenCalledOnce();
});

it("does not invent a count or issue a mutation against an older backend", async () => {
  const { result } = renderHook(() => useProductLikes("snapshot"));
  await act(async () => { await result.current.toggleLike({ id: "old" } as Product); });
  expect(mock.like).not.toHaveBeenCalled();
  expect(result.current.getState({ id: "old" } as Product).likes).toBeUndefined();
});

it("ignores old snapshot responses and 401 redirects after account changes or unmount", async () => {
  let reject!: (reason: Error) => void;
  mock.like.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }));
  const { result, rerender } = renderHook(({ source }) => useProductLikes(source), { initialProps: { source: "first" } });
  act(() => { void result.current.toggleLike(product); });
  mock.viewer = "second"; rerender({ source: "second" });
  await act(async () => { reject(new ApiError("Expired", 401)); });
  expect(result.current.getState(product)).toMatchObject({ liked: false, likes: 5, pending: false });
  expect(mock.signIn).not.toHaveBeenCalled();
  mock.like.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }));
  const next = renderHook(() => useProductLikes("third"));
  act(() => { void next.result.current.toggleLike(product); });
  next.unmount();
  await act(async () => { reject(new ApiError("Expired", 401)); });
  expect(mock.signIn).not.toHaveBeenCalled();
});
