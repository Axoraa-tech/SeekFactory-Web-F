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
};

export type RfqItem = {
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
