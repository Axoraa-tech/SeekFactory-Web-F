"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getApi } from "@/shared/api";
import { readBrowserCookie } from "@/features/auth/session-cookie";
import { useProductLikes } from "@/features/engagement/use-product-likes";
import { browserCatalogStartEnv, whenCatalogMayStart } from "./catalog-start";
import type { RecommendedProducts } from "@/shared/api/contracts";
import { CATALOG_PREVIEW_SIZE, keepPreviewFirst, loadCatalogSnapshotShared, shuffleCatalog, withCatalogRetries, type CatalogSnapshot } from "./catalog-snapshot";

type CatalogState = {
  status: "loading" | "ready" | "error";
  snapshot: CatalogSnapshot | null;
  /** A few products to show while the complete catalogue is still on its way (null once it is in). */
  preview: RecommendedProducts | null;
  retry: () => void;
  productLikes: ReturnType<typeof useProductLikes>;
};
type LoadState = Omit<CatalogState, "retry" | "productLikes"> & { session: object };
const CatalogContext = createContext<CatalogState | null>(null);

/** One in-memory snapshot for this mounted browse page, shared by LINE/SIDE photos and factory
 * cards. Never localStorage or server cached: product flags can be viewer-specific. Reused only
 * briefly within the tab and per account (loadCatalogSnapshotShared), freshly shuffled per visit. */
export function CatalogSnapshotProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const t = useTranslations();
  const [state, setState] = useState<LoadState>(() => ({ status: "loading", snapshot: null, preview: null, session: {} }));
  // Likes belong to this load, not to the snapshot: a like on a preview card survives the catalogue's arrival
  const productLikes = useProductLikes(state.session);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const viewer = readBrowserCookie()?.id ?? "";
    const session = {};
    setState({ status: "loading", snapshot: null, preview: null, session });
    let previewIds: string[] = [];
    // Small and fast even on slow links: shown until the complete catalogue arrives. Optional, so a
    // failure here changes nothing.
    let snapshotIn = false;
    Promise.resolve()
      .then(() => getApi().products.listRecommended({ limit: CATALOG_PREVIEW_SIZE }))
      .then((preview) => {
        if (cancelled || snapshotIn || !preview?.products?.length) return;
        previewIds = preview.products.map((p) => p.id);
        setState((current) => current.session !== session || current.snapshot ? current : { ...current, preview });
      })
      .catch(() => {});
    let timeout = 0;
    let retryTimer = 0;
    const wait = (ms: number) => new Promise<void>((resolve) => { retryTimer = window.setTimeout(resolve, ms); });
    // The first seek video gets the connection first; consumers keep seeing "loading" meanwhile
    const cancelStart = whenCatalogMayStart(() => {
      // A slow link gets a visible "Try again" after 45 s, but the download keeps going: if it
      // arrives later the products still appear (and "Try again" reuses the same download).
      timeout = window.setTimeout(() => {
        setState((current) => current.status === "loading" ? { ...current, status: "error" } : current);
      }, 45_000);
      withCatalogRetries(() => loadCatalogSnapshotShared(getApi(), viewer), wait, () => cancelled)
        .then((snapshot) => {
          if (cancelled) return;
          if ((readBrowserCookie()?.id ?? "") !== viewer) { retry(); return; }
          snapshotIn = true;
          setState({ status: "ready", preview: null, session, snapshot: {
            ...snapshot, products: keepPreviewFirst(previewIds, shuffleCatalog(snapshot.products)),
          } });
        })
        .catch(() => { if (!cancelled) setState((current) => ({ ...current, status: "error", snapshot: null })); })
        .finally(() => window.clearTimeout(timeout));
    }, browserCatalogStartEnv());
    // A different account in another tab must not retain this viewer's snapshot on return.
    const checkViewer = () => { if ((readBrowserCookie()?.id ?? "") !== viewer) retry(); };
    window.addEventListener("focus", checkViewer);
    return () => { cancelled = true; cancelStart(); window.clearTimeout(timeout); window.clearTimeout(retryTimer); window.removeEventListener("focus", checkViewer); };
  }, [enabled, attempt, retry]);
  const value = { status: state.status, snapshot: state.snapshot, preview: state.preview, retry, productLikes };
  return <CatalogContext.Provider value={value}>
    {enabled && state.status === "loading" && <p role="status" className="mb-3 text-sm text-ink-muted">{t("showcase.single.catalogLoading")}</p>}
    {enabled && state.status === "error" && <div role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      {t("showcase.single.catalogLoadError")}{" "}
      <button type="button" onClick={retry} className="font-semibold underline">{t("showcase.single.tryAgain")}</button>
    </div>}
    {children}
  </CatalogContext.Provider>;
}

export function useCatalogSnapshot() {
  const state = useContext(CatalogContext);
  if (!state) throw new Error("CatalogSnapshotProvider is required");
  return state;
}
