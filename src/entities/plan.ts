import type { BuyerPlanTier } from "./user";

export type BuyerPlan = {
  code: BuyerPlanTier;
  name: string;
  priceInr: number;
  priceCny: number;
  features: string[];
};

export type PlanPaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A buyer's payment request for a paid plan, decided by an admin. */
export type PlanPayment = {
  id: string;
  planName: string;
  planCode: BuyerPlanTier;
  currency: string;
  amount: number;
  status: PlanPaymentStatus;
  rejectionReason?: string;
  createdAt?: string;
  reviewedAt?: string;
};

export type PlanPaymentInput = {
  plan: BuyerPlanTier;
  region: "india" | "china";
  reference?: string;
  file: File;
};

/** Display conversion: 1 unit of base = rate units of each currency. */
export type ExchangeRates = {
  base: string;
  rates: Record<string, number>;
};
