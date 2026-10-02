export type RfqDraft = {
  productName: string;
  quantity: string;
  unit?: string;
  targetPrice?: string;
  currency?: string;
  incoterm?: string;
  details: string;
  companyName: string;
  categoryId?: string;
  destinationCountry?: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
  /** Send to this factory only (its page, a seek, a product); omitted = every factory in the category. */
  manufacturerId?: string;
  /** One of that factory's products; the backend takes the name and category from it. */
  productId?: string;
  /** The seek (video) the buyer was watching. */
  reelId?: string;
};

/** The factory, product and seek an RFQ was sent about (absent for RFQs open to a whole category). */
export type RfqTarget = {
  manufacturerId?: string;
  manufacturerName?: string;
  manufacturerSlug?: string;
  productId?: string;
  productSlug?: string;
  productImageUrl?: string;
  sourceReelId?: string;
};

export type RfqItem = RfqTarget & {
  id: string;
  referenceNumber: string;
  productName: string;
  quantity: string;
  unit?: string;
  targetPrice?: string;
  currency?: string;
  incoterm?: string;
  details?: string;
  status: string;
  createdAt: string;
  companyName?: string;
  categoryId?: string;
  buyerName?: string;
  buyerCountry?: string;
  buyerAvatarUrl?: string;
  /** This factory's own quotation (seller view only). */
  quotedPriceInr?: number;
  leadTimeDays?: number;
  quoteIncoterm?: string;
  quoteNotes?: string;
  quotedAt?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  quoteCount?: number;
  /** Present on the single-RFQ detail only. */
  quotes?: RfqQuote[];
};

export type RfqQuote = {
  id: string;
  manufacturer: import("./manufacturer").Manufacturer;
  /** Total amount quoted for the whole RFQ quantity. */
  quotePrice: number;
  currency: string;
  leadTimeDays: number;
  notes?: string;
  attachmentUrl?: string;
  /** PENDING, ACCEPTED, REJECTED or EXPIRED */
  status: string;
  createdAt: string;
  /** Set once the quote was accepted and turned into an order. */
  orderId?: string;
};
