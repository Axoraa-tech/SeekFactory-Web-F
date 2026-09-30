"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getApi } from "@/shared/api";
import {
  getExchangeRatesSnapshot,
  rateFromInr,
  setExchangeRates,
  subscribeExchangeRates,
} from "@/shared/lib/exchange-rates";
import { LOCALE_COOKIE, toLocale, type Locale } from "@/i18n/config";
import { ZH_CATEGORY_NAMES, ZH_COUNTRY_NAMES, ZH_UNIT_NAMES } from "@/i18n/zh-terms";

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

/** UI languages. Translations live in messages/en.json and messages/zh.json (next-intl). */
export const LANGUAGES: LanguageOption[] = [
  { code: "EN", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ZH", name: "Chinese (Simplified)", nativeName: "中文", flag: "🇨🇳" },
];

export const CURRENCIES: CurrencyOption[] = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AED", name: "UAE Dirham", symbol: "AED " },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "SG$" },
];

const languageFor = (locale: Locale) => (locale === "zh" ? LANGUAGES[1] : LANGUAGES[0]);

/**
 * Remembers the language for a year. The server reads the cookie, so every page is rendered in
 * the chosen language from the first byte (no English flash after a reload).
 */
export function persistLocale(locale: Locale) {
  const code = locale === "zh" ? "ZH" : "EN";
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE, code);
  } catch {
    // Storage can be unavailable (private mode); the cookie is what matters
  }
}

type RegionalSettingsContextType = {
  locale: Locale;
  selectedLanguage: LanguageOption;
  selectedCurrency: CurrencyOption;
  setLanguage: (lang: LanguageOption) => void;
  setLocale: (locale: Locale) => void;
  setCurrency: (curr: CurrencyOption) => void;
  /** Translates a message key; falls back to the given English when the key is missing. */
  t: (key: string, fallbackOrValues?: string | MessageValues, values?: MessageValues) => string;
  formatPrice: (amountInr: number) => string;
  /** Platform taxonomy names (not user text), so they are translated. */
  translateCategory: (categoryName: string) => string;
  translateCountry: (countryName: string) => string;
  translateUnit: (unitName: string) => string;
  /** User-entered text is shown exactly as written: these return their input unchanged. */
  translateProduct: (productName: string) => string;
  translateReelTitle: (title: string) => string;
  translateReelDescription: (desc: string) => string;
};

type MessageValues = Record<string, string | number | Date>;

const RegionalSettingsContext = createContext<RegionalSettingsContextType | null>(null);

const keepAsWritten = (text: string) => text;

export function RegionalSettingsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = toLocale(useLocale());
  const intl = useTranslations();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCIES[0]);

  // Re-render prices once the backend exchange rates arrive
  useSyncExternalStore(subscribeExchangeRates, getExchangeRatesSnapshot, getExchangeRatesSnapshot);
  useEffect(() => {
    getApi()
      .platform.getExchangeRates()
      .then((res) => setExchangeRates(res.rates))
      .catch(() => {
        // Prices stay in INR when rates are unavailable
      });
  }, []);

  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem("seek_curr");
      const found = savedCurr && CURRENCIES.find((c) => c.code === savedCurr);
      if (found) setSelectedCurrency(found);
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      persistLocale(next);
      // Re-render the server components with the new messages; client state (scroll, open tabs) survives
      router.refresh();
    },
    [locale, router]
  );

  const handleSetCurrency = (curr: CurrencyOption) => {
    setSelectedCurrency(curr);
    try {
      localStorage.setItem("seek_curr", curr.code);
      document.cookie = `seek_curr=${curr.code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  // Stable per language, so it is safe in effect / callback dependency lists
  const t = useCallback(
    (key: string, fallbackOrValues?: string | MessageValues, values?: MessageValues): string => {
      const fallback = typeof fallbackOrValues === "string" ? fallbackOrValues : undefined;
      const vals = typeof fallbackOrValues === "object" ? fallbackOrValues : values;
      return intl.has(key) ? intl(key, vals) : fallback || key;
    },
    [intl]
  );

  const formatPrice = (amountInr: number): string => {
    // Rates come from the backend; until they load (or for an unknown currency) show INR
    const rate = rateFromInr(selectedCurrency.code);
    if (selectedCurrency.code === "INR" || rate === undefined) {
      return `₹${amountInr.toLocaleString("en-IN")}`;
    }
    const converted = amountInr * rate;
    const sym = selectedCurrency.symbol;

    if (selectedCurrency.code === "JPY") {
      return `${sym}${Math.round(converted).toLocaleString("ja-JP")}`;
    }

    if (converted >= 1000) {
      return `${sym}${Math.round(converted).toLocaleString()}`;
    }

    if (converted < 10) {
      return `${sym}${converted.toFixed(2)}`;
    }

    return `${sym}${converted.toFixed(1)}`;
  };

  const zh = locale === "zh";
  const translateCategory = (name: string) => (zh ? ZH_CATEGORY_NAMES[name.trim()] ?? name : name);
  const translateCountry = (name: string) => (zh ? ZH_COUNTRY_NAMES[name.trim()] ?? name : name);
  const translateUnit = (unit: string) => (zh ? ZH_UNIT_NAMES[unit.trim().toLowerCase()] ?? unit : unit);

  return (
    <RegionalSettingsContext.Provider
      value={{
        locale,
        selectedLanguage: languageFor(locale),
        selectedCurrency,
        setLanguage: (lang) => setLocale(toLocale(lang.code)),
        setLocale,
        setCurrency: handleSetCurrency,
        t,
        formatPrice,
        translateCategory,
        translateCountry,
        translateUnit,
        translateProduct: keepAsWritten,
        translateReelTitle: keepAsWritten,
        translateReelDescription: keepAsWritten,
      }}
    >
      {children}
    </RegionalSettingsContext.Provider>
  );
}

export function useRegionalSettings() {
  const context = useContext(RegionalSettingsContext);
  if (!context) {
    // Fallback safe values for SSR or unmounted state
    return {
      locale: "en" as Locale,
      selectedLanguage: LANGUAGES[0],
      selectedCurrency: CURRENCIES[0],
      setLanguage: () => {},
      setLocale: () => {},
      setCurrency: () => {},
      t: (key: string, fallbackOrValues?: string | MessageValues) => (typeof fallbackOrValues === "string" ? fallbackOrValues : key),
      formatPrice: (amountInr: number) => `₹${amountInr.toLocaleString()}`,
      translateCategory: keepAsWritten,
      translateCountry: keepAsWritten,
      translateUnit: keepAsWritten,
      translateProduct: keepAsWritten,
      translateReelTitle: keepAsWritten,
      translateReelDescription: keepAsWritten,
    };
  }
  return context;
}
