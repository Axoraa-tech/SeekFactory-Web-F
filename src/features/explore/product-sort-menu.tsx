"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";
import { PRODUCT_SORTS, type ProductSort } from "./product-sort";

/** Explore's "Sort" control: keeps the choice in the URL (?sort=), so it survives reloads and shares. */
export function ProductSortMenu({ current }: { current: ProductSort }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    // Focus the chosen option, so arrow keys start from there
    itemsRef.current[PRODUCT_SORTS.indexOf(current)]?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, current]);

  const choose = (sort: ProductSort) => {
    setOpen(false);
    if (sort === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "relevance") params.delete("sort");
    else params.set("sort", sort);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const onItemKey = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    itemsRef.current[(index + step + PRODUCT_SORTS.length) % PRODUCT_SORTS.length]?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="sf-btn-soft inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-canvas"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" /> : <ArrowUpDown className="h-3.5 w-3.5 text-ink-muted" />}
        <span className="text-ink-muted">{t("explore.sort.label")}:</span>
        {t(`explore.sort.options.${current}`)}
        <ChevronDown className={cn("h-3.5 w-3.5 text-ink-muted transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("explore.sort.label")}
          className="sf-menu-in absolute left-0 top-full z-40 mt-1.5 w-56 origin-top-left overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-card"
        >
          {PRODUCT_SORTS.map((sort, i) => (
            <button
              key={sort}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={sort === current}
              onClick={() => choose(sort)}
              onKeyDown={(e) => onItemKey(e, i)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs outline-none transition-colors hover:bg-canvas focus-visible:bg-canvas",
                sort === current ? "font-semibold text-brand-orange" : "text-ink",
              )}
            >
              {t(`explore.sort.options.${sort}`)}
              {sort === current && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
