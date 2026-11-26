import type { BuyerPlanTier } from "./user";

export type BuyerPlan = {
  code: BuyerPlanTier;
  name: string;
  priceInr: number;
  priceCny: number;
  features: string[];
};

export type PlanPaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A factory's membership plan (seller hub "Global Enterprise Membership Plans"). */
export type FactoryMembershipPlan = "basic" | "premium" | "vip" | "strategic";

/** Any plan that is paid for with a payment proof: a buyer plan or a paid factory plan. */
export type PaidPlanCode = BuyerPlanTier | Exclude<FactoryMembershipPlan, "basic">;

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
  plan: PaidPlanCode;
  region: "india" | "china";
  reference?: string;
  file: File;
};

/** Display conversion: 1 unit of base = rate units of each currency. */
export type ExchangeRates = {
  base: string;
  rates: Record<string, number>;
};
