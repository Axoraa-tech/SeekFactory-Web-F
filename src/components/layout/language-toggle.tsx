"use client";

import { useTransition } from "react";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

/**
 * EN / 中 switch. The choice is kept in a cookie for a year and the server renders every page in
 * it, so a reload (or a new tab) opens in the same language.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useRegionalSettings();
  const [isPending, startTransition] = useTransition();
  const isZh = locale === "zh";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isZh}
      aria-label={isZh ? "切换到英文 / Switch to English" : "Switch to Chinese / 切换到中文"}
      title={isZh ? "English" : "中文"}
      disabled={isPending}
      onClick={() => startTransition(() => setLocale(isZh ? "en" : "zh"))}
      className={cn(
        "relative inline-flex h-9 w-[76px] shrink-0 items-center rounded-full border border-[rgba(28,22,22,0.1)] bg-white p-0.5 text-xs font-semibold shadow-[0_1px_2px_rgba(28,22,22,0.05)] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
        isPending && "opacity-70",
        className
      )}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-brand-blue shadow-[0_2px_6px_-2px_rgba(26,115,232,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isZh && "translate-x-full"
        )}
      />
      <span className={cn("relative z-10 flex-1 text-center transition-colors", isZh ? "text-ink-muted" : "text-white")}>EN</span>
      <span className={cn("relative z-10 flex-1 text-center text-[13px] transition-colors", isZh ? "text-white" : "text-ink-muted")}>中</span>
    </button>
  );
}
