"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { AdminApiError, type AdminPage } from "@/shared/api/admin-api";

/* ─────────── data hook ─────────── */

/**
 * Loads a paged admin list. Keeps the previous rows visible while refetching (no flicker),
 * ignores out-of-order responses, and redirects to login when the session has expired.
 */
export function useAdminList<T, P extends object>(fetcher: (params: P) => Promise<AdminPage<T>>, params: P) {
  const router = useRouter();
  const [data, setData] = useState<AdminPage<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);
  const key = JSON.stringify(params);

  const reload = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const next = await fetcher(JSON.parse(key));
      if (id !== reqId.current) return;
      setData(next);
      setError(null);
    } catch (err) {
      if (id !== reqId.current) return;
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError((err as Error).message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, router]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Optimistically patch one row locally, e.g. after a toggle. */
  const patch = useCallback((match: (row: T) => boolean, update: Partial<T>) => {
    setData((d) => (d ? { ...d, items: d.items.map((r) => (match(r) ? { ...r, ...update } : r)) } : d));
  }, []);

  return { data, error, loading, reload, patch };
}

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ─────────── toasts ─────────── */

type Toast = { id: number; kind: "success" | "error"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg bg-white ${t.kind === "success" ? "border-emerald-200 text-emerald-800" : "border-red-200 text-red-700"}`}
          >
            {t.kind === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ─────────── layout pieces ─────────── */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700" aria-label="Clear search">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function FilterChips<V extends string>({ options, value, onChange, counts }: {
  options: { value: V; label: string; countKey?: string }[];
  value: V;
  onChange: (v: V) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
      {options.map((o) => {
        const active = o.value === value;
        const count = o.countKey && counts ? counts[o.countKey] : undefined;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
          >
            {o.label}
            {count !== undefined && <span className={`ml-1.5 tabular-nums ${active ? "text-slate-300" : "text-slate-400"}`}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey, loading, error, onRetry, empty, onRowClick }: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty: string;
  onRowClick?: (row: T) => void;
}) {
  const firstLoad = loading && !rows;
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading && rows && <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-orange-500" />}
      {error && (
        <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
          {onRetry && <button onClick={onRetry} className="font-medium underline">Retry</button>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>{columns.map((c) => <th key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>{c.header}</th>)}</tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 transition-opacity ${loading && rows ? "opacity-60" : ""}`}>
            {firstLoad &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-4"><div className="h-4 rounded bg-slate-100 animate-pulse" /></td>
                  ))}
                </tr>
              ))}
            {rows?.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={`hover:bg-slate-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>{c.cell(r)}</td>)}
              </tr>
            ))}
            {rows && rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>{from}–{to} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onPage(page - 1)} className="rounded-lg border border-slate-200 bg-white p-1.5 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 tabular-nums">{page + 1} / {pages}</span>
        <button disabled={page + 1 >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border border-slate-200 bg-white p-1.5 disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const TONES = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  slate: "bg-slate-50 text-slate-600 border-slate-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
} as const;

export function Pill({ tone = "slate", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

/** Switch that shows a spinner while its async action runs. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => Promise<void> | void; label: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try { await onChange(!checked); } finally { setBusy(false); }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}>
        {busy && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
      </span>
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name?: string) {
  return (name ?? "?").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}
