"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type ToastKind = "success" | "error" | "info";

type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** How long a toast stays up; errors stay longer so they can be read. */
const DURATION_MS: Record<ToastKind, number> = { success: 3500, info: 3500, error: 6000 };
const MAX_VISIBLE = 3;

const STYLES: Record<ToastKind, { box: string; icon: ReactNode }> = {
  success: {
    box: "border-emerald-200 bg-white text-ink",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />,
  },
  error: {
    box: "border-rose-200 bg-white text-ink",
    icon: <XCircle className="h-4 w-4 shrink-0 text-rose-600" />,
  },
  info: {
    box: "border-blue-200 bg-white text-ink",
    icon: <Info className="h-4 w-4 shrink-0 text-brand-blue" />,
  },
};

/**
 * App-wide toasts in the top-right corner. Rendered into document.body so no parent
 * transform, overflow or stacking context can hide them.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    setMounted(true);
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, kind, message }].slice(-MAX_VISIBLE));
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS[kind]));
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
      info: (message) => show("info", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed right-4 top-20 z-[1000] flex w-[min(92vw,360px)] flex-col gap-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role={toast.kind === "error" ? "alert" : "status"}
                className={cn(
                  "pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs font-semibold shadow-lg glass-fade-in",
                  STYLES[toast.kind].box,
                )}
              >
                {STYLES[toast.kind].icon}
                <span className="min-w-0 flex-1 leading-relaxed">{toast.message}</span>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismiss(toast.id)}
                  className="-m-1 rounded p-1 text-ink-faint hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

/** Show a toast from any client component under ToastProvider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}
