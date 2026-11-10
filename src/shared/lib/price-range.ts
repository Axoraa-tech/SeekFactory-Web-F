/**
 * Product price helpers. `priceInr` is the single price or the minimum of a range;
 * `priceMaxInr` is the optional upper bound (absent = single price).
 */

/**
 * Normalises what the seller typed into a price box: digits and one decimal point only,
 * without the leading zeros a number input leaves behind ("05" → "5", but "0.5" stays).
 */
export function sanitizePriceInput(raw: string): string {
  let value = raw.replace(/[^\d.]/g, "");
  const dot = value.indexOf(".");
  if (dot !== -1) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  value = value.replace(/^0+(?=\d)/, "");
  return value.startsWith(".") ? `0${value}` : value;
}

/** Parses a sanitised price box; empty means "not entered". */
export function parsePriceInput(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export type PriceRangeError = "minRequired" | "negative" | "maxBelowMin";

/** Validates a price (range); the max is optional. */
export function validatePriceRange(min: number | undefined, max: number | undefined): PriceRangeError | null {
  if (min === undefined || !(min > 0)) return min !== undefined && min < 0 ? "negative" : "minRequired";
  if (max !== undefined) {
    if (max < 0) return "negative";
    if (max < min) return "maxBelowMin";
  }
  return null;
}

/** The range maximum worth showing, or undefined for a single price. */
export function rangeMax(priceInr: number, priceMaxInr?: number | null): number | undefined {
  return typeof priceMaxInr === "number" && Number.isFinite(priceMaxInr) && priceMaxInr > priceInr
    ? priceMaxInr
    : undefined;
}

/** "₹100" or "₹100 – ₹250" using the given single-amount formatter. */
export function formatPriceRange(
  priceInr: number,
  priceMaxInr: number | null | undefined,
  format: (inr: number) => string,
): string {
  const max = rangeMax(priceInr, priceMaxInr);
  return max === undefined ? format(priceInr) : `${format(priceInr)} – ${format(max)}`;
}
