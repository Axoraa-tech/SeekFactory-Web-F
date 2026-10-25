"use client";

import { useEffect, useRef, useState } from "react";
import { readBrowserCookie } from "@/features/auth/session-cookie";
import type { Product } from "@/entities/product";
import { getApi } from "@/shared/api";
import { ApiError } from "@/shared/api/http-api";
import { useRequireSignIn } from "./use-engagement";
import { invalidateCatalogSnapshot } from "@/features/feed/catalog-snapshot";

type LikeState = { liked: boolean; likes: number | undefined; pending: boolean; error: boolean };

/** One controller per catalogue snapshot: desktop/strip cards share state and in-flight guards.
 * A new snapshot/account discards overrides; old requests cannot update the new viewer's state. */
export function useProductLikes(source: unknown) {
  const requireSignIn = useRequireSignIn();
  const [state, setState] = useState<{ source: unknown; entries: Record<string, LikeState> }>({ source, entries: {} });
  const pending = useRef({ source, ids: new Set<string>() });
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  if (pending.current.source !== source) pending.current = { source, ids: new Set() };
  const getState = (product: Product): LikeState => (state.source === source ? state.entries[product.id] : undefined)
    ?? { liked: Boolean(product.likedByMe), likes: product.likesCount, pending: false, error: false };
  const update = (id: string, value: LikeState) => {
    if (pending.current.source !== source) return;
    setState((previous) => ({ source, entries: { ...(previous.source === source ? previous.entries : {}), [id]: value } }));
  };
  const toggleLike = async (product: Product) => {
    const before = getState(product);
    const viewer = readBrowserCookie()?.id;
    const current = () => mounted.current && pending.current.source === source && readBrowserCookie()?.id === viewer;
    // Undefined means an older backend did not send a count. Never present a fabricated zero.
    if (before.likes === undefined || pending.current.ids.has(product.id)) return;
    pending.current.ids.add(product.id);
    update(product.id, { liked: !before.liked, likes: Math.max(0, before.likes + (before.liked ? -1 : 1)), pending: true, error: false });
    try {
      const response = await getApi().products.toggleLike(product.id);
      // The reusable catalogue still has the old like: the next visit loads a fresh one
      invalidateCatalogSnapshot();
      if (current()) update(product.id, { liked: response.liked, likes: response.likesCount, pending: false, error: false });
    } catch (error) {
      if (current()) {
        update(product.id, { ...before, pending: false, error: true });
        if (error instanceof ApiError && error.status === 401) requireSignIn();
      }
    } finally {
      if (pending.current.source === source) pending.current.ids.delete(product.id);
    }
  };
  return { getState, toggleLike };
}
