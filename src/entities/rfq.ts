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
  buyerName?: string;
  buyerCountry?: string;
  quotedPriceInr?: number;
  leadTimeDays?: number;
};
