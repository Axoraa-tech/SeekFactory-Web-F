"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminData } from "@/shared/api/admin-api";

/**
 * How many manufacturers are waiting for review.
 *
 * Polled rather than pushed: approvals are not second-sensitive, and polling needs
 * no new infrastructure. The count comes from the list endpoint's `counts` map, so
 * there is no extra endpoint to maintain. Refreshes on an interval and whenever the
 * tab regains focus, so an admin returning to it sees a current number.
 */

const POLL_MS = 60_000;

const PendingContext = createContext<{ pending: number; refresh: () => void }>({
  pending: 0,
  refresh: () => {},
});

export function usePendingApprovals() {
  return useContext(PendingContext);
}

export function PendingApprovalsProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);

  const refresh = useCallback(() => {
    // size 1 — only the counts matter, not the rows
    adminData.manufacturers({ page: 0, size: 1, filter: "unverified" })
      .then((p) => setPending(p.counts?.unverified ?? 0))
      .catch(() => {/* signed out or offline: leave the last known count */});
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <PendingContext.Provider value={{ pending, refresh }}>{children}</PendingContext.Provider>;
}

/** Count badge for the nav. Renders nothing at zero so the chrome stays quiet. */
export function PendingBadge({ className = "" }: { className?: string }) {
  const { pending } = usePendingApprovals();
  if (pending === 0) return null;
  return (
    <span
      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white ${className}`}
      aria-label={`${pending} awaiting review`}
    >
      {pending > 99 ? "99+" : pending}
    </span>
  );
}
