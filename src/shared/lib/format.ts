import { rateFromInr } from "@/shared/lib/exchange-rates";

export function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    const rounded = value / 1_000;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}K`;
  }
  return String(value);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  JPY: "¥",
  AED: "AED ",
  CAD: "CA$",
  AUD: "AU$",
  SGD: "SG$",
};

export function formatPriceInr(value: number, targetCurrencyCode?: string): string {
  let curr = targetCurrencyCode;
  if (!curr && typeof window !== "undefined") {
    try {
      curr = localStorage.getItem("seek_curr") || undefined;
    } catch {}
  }
  // Rates come from the backend; unknown currency or rate → show the INR price itself
  const rate = curr ? rateFromInr(curr) : undefined;
  if (!curr || curr === "INR" || rate === undefined || !CURRENCY_SYMBOLS[curr]) {
    return `${CURRENCY_SYMBOLS.INR}${value.toLocaleString("en-IN")}`;
  }
  const config = { symbol: CURRENCY_SYMBOLS[curr] };
  const converted = value * rate;

  if (curr === "JPY") {
    return `${config.symbol}${Math.round(converted).toLocaleString("ja-JP")}`;
  }
  if (converted >= 1000) {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
  if (converted < 10) {
    return `${config.symbol}${converted.toFixed(2)}`;
  }
  return `${config.symbol}${converted.toFixed(1)}`;
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * "just now", "5m ago", "3h ago", "2d ago", then a short date (Chinese: 刚刚, 5 分钟前 …).
 * Non-date strings pass through unchanged; an empty value renders as an empty string.
 */
export function formatRelativeTime(value: string | undefined, locale: string = "en"): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  const zh = locale.startsWith("zh");
  const seconds = Math.round((Date.now() - time) / 1000);
  if (seconds < 60) return zh ? "刚刚" : "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return zh ? `${minutes} 分钟前` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return zh ? `${hours} 小时前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return zh ? `${days} 天前` : `${days}d ago`;
  return new Date(time).toLocaleDateString(zh ? "zh-CN" : undefined, { day: "numeric", month: "short", year: "numeric" });
}
