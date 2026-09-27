/**
 * Minimum order quantity from a product's free-text MOQ ("500 pcs", "1,000 units").
 * Mirrors the backend's rule, which rejects cart lines below it; 1 when there is no number.
 */
export function minimumOrderQuantity(moq: string | number | undefined): number {
  if (typeof moq === "number") return moq > 0 ? Math.floor(moq) : 1;
  const match = moq?.match(/^\s*([0-9][0-9,]*)/);
  const value = match ? Number(match[1].replace(/,/g, "")) : NaN;
  return Number.isFinite(value) && value > 0 ? value : 1;
}
