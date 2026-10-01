import type { Manufacturer } from "./manufacturer";
import type { Product } from "./product";

/**
 * A buyer's order request. SeekFactory takes no payment: the order notifies the factory,
 * which contacts the buyer and moves the status as the deal progresses.
 */
export type OrderStatus = "PENDING" | "CONTACTED" | "NEGOTIATING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

/** Where a request came from: a product page, the cart, or an accepted RFQ quote. */
export type OrderSource = "DIRECT" | "CART" | "RFQ_QUOTE";

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
  /** Listing price × quantity at order time (or the quoted INR total); the final price is negotiated. */
  estimatedTotalInr?: number;
  buyerNote?: string;
  sellerNote?: string;
  manufacturer: OrderParty;
  buyer: OrderParty;
  source?: OrderSource;
  /** RFQ of the accepted quote, for RFQ_QUOTE requests. */
  rfqId?: string;
  /** Currency of quotedTotal (listing prices are INR). */
  currency?: string;
  /** Total the factory quoted, for RFQ_QUOTE requests. */
  quotedTotal?: number;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
  cancelReason?: string;
  /** The buyer may still withdraw it (before the deal is confirmed). */
  cancellable?: boolean;
};

/** Delivery contact shared with the factory with a request. */
export type OrderContact = {
  contactName: string;
  contactPhone: string;
  deliveryAddress: string;
  note?: string;
};

/** A cart line chosen at checkout, with the note sent to its factory. */
export type CheckoutLine = {
  cartItemId: string;
  note?: string;
};

export type NewOrderRequest = {
  productSlug: string;
  quantity: number;
  note?: string;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
};

export type CartItem = {
  id: string;
  product: Product;
  manufacturer: Manufacturer;
  quantity: number;
  /** Minimum order quantity parsed from the product's MOQ. */
  minQuantity: number;
  /** INR per unit after bulk tiers for this quantity; absent when the price is negotiated. */
  unitPrice?: number;
  lineTotal?: number;
};

export type Cart = {
  items: CartItem[];
  itemCount: number;
  /** Sum of priced lines only. */
  totalAmount: number;
  currency: string;
};
