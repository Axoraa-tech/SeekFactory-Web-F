"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRegionalSettings, CURRENCIES, type CurrencyOption } from "@/shared/i18n/regional-context";

/** Currency picker. Language has its own EN / 中 switch (LanguageToggle). */
export function LanguageCurrencyDropdown() {
  const t = useTranslations("currency");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { selectedCurrency, setCurrency } = useRegionalSettings();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleSelect = (curr: CurrencyOption) => {
    setCurrency(curr);
    setIsOpen(false);
    setSearch("");
  };

  const q = search.toLowerCase();
  const filtered = CURRENCIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("label")}
        title={t("label")}
        className={`group flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
          isOpen ? "border-[rgba(28,22,22,0.2)] bg-white" : "border-[rgba(28,22,22,0.1)] bg-white hover:border-[rgba(28,22,22,0.2)]"
        }`}
      >
        <span className="text-ink-muted">{selectedCurrency.symbol.trim()}</span>
        <span>{selectedCurrency.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-ink-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl ring-1 ring-black/5">
          <p className="px-2 pb-2 pt-1 text-xs font-bold text-ink">{t("title")}</p>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-faint" />
            <input
              type="text"
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
            />
          </div>
          <div role="listbox" className="max-h-60 space-y-0.5 overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  role="option"
                  aria-selected={curr.code === selectedCurrency.code}
                  onClick={() => handleSelect(curr)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    curr.code === selectedCurrency.code ? "bg-brand-blue-soft font-semibold text-brand-blue" : "text-ink hover:bg-canvas"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-6 text-center font-bold text-slate-700">{curr.symbol.trim()}</span>
                    <span>{curr.code}</span>
                    <span className="text-[11px] text-ink-muted">{t(`names.${curr.code}`)}</span>
                  </span>
                  {curr.code === selectedCurrency.code && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-2 text-center text-xs text-ink-muted">{t("noResults")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
