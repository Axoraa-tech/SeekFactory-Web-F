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

const CURRENCY_RATES: Record<string, { symbol: string; rate: number }> = {
  INR: { symbol: "₹", rate: 1.0 },
  USD: { symbol: "$", rate: 0.01149 },
  EUR: { symbol: "€", rate: 0.01053 },
  GBP: { symbol: "£", rate: 0.00893 },
  CNY: { symbol: "¥", rate: 0.0833 },
  JPY: { symbol: "¥", rate: 1.724 },
  AED: { symbol: "AED ", rate: 0.0422 },
  CAD: { symbol: "CA$", rate: 0.0161 },
  AUD: { symbol: "AU$", rate: 0.0178 },
  SGD: { symbol: "SG$", rate: 0.0151 },
};

export function formatPriceInr(value: number, targetCurrencyCode?: string): string {
  let curr = targetCurrencyCode;
  if (!curr && typeof window !== "undefined") {
    try {
      curr = localStorage.getItem("seek_curr") || undefined;
    } catch {}
  }
  const config = (curr && CURRENCY_RATES[curr]) || CURRENCY_RATES.INR;
  const converted = value * config.rate;

  if (curr === "INR" || !curr) {
    return `${config.symbol}${value.toLocaleString("en-IN")}`;
  }
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
