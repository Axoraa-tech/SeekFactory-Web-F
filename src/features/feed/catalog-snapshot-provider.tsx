"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getApi } from "@/shared/api";
import { readBrowserCookie } from "@/features/auth/session-cookie";
import { loadCatalogSnapshot, shuffleCatalog, type CatalogSnapshot } from "./catalog-snapshot";

type CatalogState = { status: "loading" | "ready" | "error"; snapshot: CatalogSnapshot | null; retry: () => void };
const CatalogContext = createContext<CatalogState | null>(null);

/** One in-memory snapshot for this mounted browse page, shared by LINE/SIDE photos and factory
 * cards. Never global, localStorage or server cached: product flags can be viewer-specific. */
export function CatalogSnapshotProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const t = useTranslations();
  const [state, setState] = useState<Omit<CatalogState, "retry">>({ status: "loading", snapshot: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const viewer = readBrowserCookie()?.id ?? "";
    setState({ status: "loading", snapshot: null });
    const timeout = window.setTimeout(() => {
      cancelled = true;
      setState({ status: "error", snapshot: null });
    }, 45_000);
    loadCatalogSnapshot(getApi(), () => cancelled)
      .then((snapshot) => {
        if (cancelled) return;
        if ((readBrowserCookie()?.id ?? "") !== viewer) { retry(); return; }
        setState({ status: "ready", snapshot: { ...snapshot, products: shuffleCatalog(snapshot.products) } });
      })
      .catch(() => { if (!cancelled) setState({ status: "error", snapshot: null }); })
      .finally(() => window.clearTimeout(timeout));
    // A different account in another tab must not retain this viewer's snapshot on return.
    const checkViewer = () => { if ((readBrowserCookie()?.id ?? "") !== viewer) retry(); };
    window.addEventListener("focus", checkViewer);
    return () => { cancelled = true; window.clearTimeout(timeout); window.removeEventListener("focus", checkViewer); };
  }, [enabled, attempt, retry]);
  return <CatalogContext.Provider value={{ ...state, retry }}>
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
