/**
 * A buyer's order request. SeekFactory takes no payment: the order notifies the factory,
 * which contacts the buyer and moves the status as the deal progresses.
 */
export type OrderStatus = "PENDING" | "CONTACTED" | "NEGOTIATING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type OrderParty = {
  id: string;
  name: string;
  slug?: string;
  companyName?: string;
  country?: string;
  avatarUrl?: string;
  /** Buyer contact details are only present in the seller's view. */
  email?: string;
  phone?: string;
};

export type OrderRequest = {
  id: string;
  referenceNumber: string;
  status: OrderStatus;
  statusUpdatedAt?: string;
  createdAt: string;
  productId?: string;
  productSlug?: string;
  productName: string;
  productImageUrl?: string;
  unitPriceInr?: number;
  unit?: string;
  quantity: number;
  /** Listing price × quantity at order time; the final price is negotiated. */
  estimatedTotalInr?: number;
  buyerNote?: string;
  sellerNote?: string;
  manufacturer: OrderParty;
  buyer: OrderParty;
};

export type NewOrderRequest = {
  productSlug: string;
  quantity: number;
  note?: string;
};
