"use client";

import { useRef, useState } from "react";
import { shareLink } from "@/shared/lib/share-link";

/** Products have no share counter API. Share their canonical detail link without inventing one. */
export function useProductShare(slug: string, name: string) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "shared" | "error">("idle");
  const share = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setStatus("idle");
    try {
      await shareLink(name, new URL(`/products/${encodeURIComponent(slug)}`, window.location.origin).href);
      setStatus("shared");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("error");
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return { share, pending, status };
}
