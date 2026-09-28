import type { BuyerPlanTier } from "./user";

export type BuyerPlan = {
  code: BuyerPlanTier;
  name: string;
  priceInr: number;
  priceCny: number;
  features: string[];
};

/** Display conversion: 1 unit of base = rate units of each currency. */
export type ExchangeRates = {
  base: string;
  rates: Record<string, number>;
};
