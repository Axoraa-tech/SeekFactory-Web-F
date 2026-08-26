"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check, Search, DollarSign, Languages, Sparkles } from "lucide-react";

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: "EN", name: "English (US)", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "EN-GB", name: "English (UK)", nativeName: "English (UK)", flag: "🇬🇧" },
  { code: "ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ZH", name: "Chinese (Simplified)", nativeName: "中文(简体)", flag: "🇨🇳" },
  { code: "JA", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "AR", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "HI", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "PT", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
];

const CURRENCIES: CurrencyOption[] = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "CN¥" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SGD", name: "Singapore Dollar", symbol: "SG$" },
];

export function LanguageCurrencyDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCIES[0]);

  // Sub-dropdown open states inside main popover
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrOpen, setIsCurrOpen] = useState(false);

  // Search queries
  const [langSearch, setLangSearch] = useState("");
  const [currSearch, setCurrSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load saved preferences if available
  useEffect(() => {
    try {
      const savedLangCode = localStorage.getItem("seek_lang");
      const savedCurrCode = localStorage.getItem("seek_curr");
      if (savedLangCode) {
        const foundLang = LANGUAGES.find((l) => l.code === savedLangCode);
        if (foundLang) setSelectedLanguage(foundLang);
      }
      if (savedCurrCode) {
        const foundCurr = CURRENCIES.find((c) => c.code === savedCurrCode);
        if (foundCurr) setSelectedCurrency(foundCurr);
      }
    } catch {
      // ignore SSR errors
    }
  }, []);

  // Outside click & escape handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsLangOpen(false);
        setIsCurrOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsLangOpen(false);
        setIsCurrOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setIsLangOpen(false);
    try {
      localStorage.setItem("seek_lang", lang.code);
    } catch {}
  };

  const handleSelectCurrency = (curr: CurrencyOption) => {
    setSelectedCurrency(curr);
    setIsCurrOpen(false);
    try {
      localStorage.setItem("seek_curr", curr.code);
    } catch {}
  };

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currSearch.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button Pill matching UserDropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
          isOpen
            ? "border-brand-blue bg-blue-50/50 shadow-sm"
            : "border-transparent hover:border-line hover:bg-canvas"
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100/80 text-brand-blue ring-2 ring-brand-blue/20 transition-transform duration-200 group-hover:scale-105">
          <Globe className="h-4 w-4" />
        </div>
        <span className="hidden sm:block text-left leading-tight">
          <span className="block text-xs font-semibold text-ink group-hover:text-brand-blue transition-colors">
            {selectedLanguage.code} <span className="text-ink-faint font-normal">/</span> {selectedCurrency.code}
          </span>
        </span>
        <span className="sm:hidden text-xs font-semibold text-ink">
          {selectedLanguage.code}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-faint transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-blue" : "group-hover:text-ink"
          }`}
        />
      </button>

      {/* Modern Dropdown Menu matching UserDropdown layout & design */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 origin-top-left rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Card matching UserDropdown */}
          <div className="mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-3 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue ring-2 ring-white shadow-sm">
                <Globe className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">Regional Settings</p>
                <p className="truncate text-xs text-ink-muted">Language & Currency Preferences</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold text-brand-blue">
                    <Sparkles className="h-3 w-3 text-brand-blue" />
                    {selectedLanguage.flag} {selectedLanguage.code} · {selectedCurrency.symbol} ({selectedCurrency.code})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Sections matching UserDropdown items */}
          <div className="space-y-1">
            {/* SUB DROPDOWN 1: LANGUAGE */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsLangOpen((prev) => !prev);
                  setIsCurrOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors group ${
                  isLangOpen ? "bg-blue-50/80 text-brand-blue font-semibold" : "hover:bg-canvas text-ink"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Languages className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-blue transition-colors" />
                  <div className="text-left truncate">
                    <span className="block text-xs font-semibold">Language</span>
                    <span className="block text-[11px] text-ink-muted font-normal truncate">
                      {selectedLanguage.flag} {selectedLanguage.name}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted group-hover:bg-blue-100 group-hover:text-brand-blue">
                    {selectedLanguage.code}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-ink-faint transition-transform duration-200 ${
                      isLangOpen ? "rotate-180 text-brand-blue" : "group-hover:text-ink"
                    }`}
                  />
                </span>
              </button>

              {/* Sub-menu panel for Language */}
              {isLangOpen && (
                <div className="mx-1 my-1 rounded-xl border border-slate-100 bg-slate-50/60 p-2 shadow-xs animate-in fade-in duration-150">
                  <div className="relative mb-2 px-0.5">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-faint" />
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleSelectLanguage(lang)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                            lang.code === selectedLanguage.code
                              ? "bg-blue-100/80 text-brand-blue font-semibold"
                              : "text-ink hover:bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-sm">{lang.flag}</span>
                            <span>{lang.name}</span>
                            <span className="text-[10px] text-ink-faint">({lang.nativeName})</span>
                          </span>
                          {lang.code === selectedLanguage.code && (
                            <Check className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-center text-xs text-ink-muted">No language found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SUB DROPDOWN 2: CURRENCY */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsCurrOpen((prev) => !prev);
                  setIsLangOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors group ${
                  isCurrOpen ? "bg-blue-50/80 text-brand-blue font-semibold" : "hover:bg-canvas text-ink"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <DollarSign className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-blue transition-colors" />
                  <div className="text-left truncate">
                    <span className="block text-xs font-semibold">Currency</span>
                    <span className="block text-[11px] text-ink-muted font-normal truncate">
                      {selectedCurrency.symbol} - {selectedCurrency.name}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted group-hover:bg-blue-100 group-hover:text-brand-blue">
                    {selectedCurrency.code}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-ink-faint transition-transform duration-200 ${
                      isCurrOpen ? "rotate-180 text-brand-blue" : "group-hover:text-ink"
                    }`}
                  />
                </span>
              </button>

              {/* Sub-menu panel for Currency */}
              {isCurrOpen && (
                <div className="mx-1 my-1 rounded-xl border border-slate-100 bg-slate-50/60 p-2 shadow-xs animate-in fade-in duration-150">
                  <div className="relative mb-2 px-0.5">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-faint" />
                    <input
                      type="text"
                      placeholder="Search currency..."
                      value={currSearch}
                      onChange={(e) => setCurrSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => handleSelectCurrency(curr)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                            curr.code === selectedCurrency.code
                              ? "bg-blue-100/80 text-brand-blue font-semibold"
                              : "text-ink hover:bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="w-5 text-center font-bold text-slate-700">{curr.symbol}</span>
                            <span>{curr.code}</span>
                            <span className="text-[11px] text-ink-muted">({curr.name})</span>
                          </span>
                          {curr.code === selectedCurrency.code && (
                            <Check className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-center text-xs text-ink-muted">No currency found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="my-1.5 h-px bg-slate-100" />

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-3 py-1 text-xs">
            <span className="text-[11px] text-ink-muted">Auto-saves preferences</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsLangOpen(false);
                setIsCurrOpen(false);
              }}
              className="rounded-lg bg-brand-blue px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-brand-blue-dark transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
