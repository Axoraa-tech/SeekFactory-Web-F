export const SELLER_TABS = ["overview", "products", "seeks", "rfqs", "orders", "messages", "profile", "account"] as const;

export type SellerTab = (typeof SELLER_TABS)[number];

/** `?tab=` value → a known seller hub tab (anything else opens the overview). */
export function parseSellerTab(value: string | null | undefined): SellerTab {
  return SELLER_TABS.includes(value as SellerTab) ? (value as SellerTab) : "overview";
}

/**
 * Seller KPIs. `null` means "not enough data yet" (e.g. no views in the previous period,
 * no RFQs received) and must be shown as such, never replaced with a made-up number.
 */
export type SellerStats = {
  /** Window (days) covered by the view counts; change % compares with the window before. */
  periodDays?: number;
  totalProductViews: number;
  productViewsChange: number | null; // e.g. +18.4 (%)
  factoryProfileVisits: number;
  profileVisitsChange: number | null;
  videoSeekPlays: number;
  videoPlaysChange: number | null;
  activeRfqsCount: number;
  /** Active RFQs this factory has not quoted yet. */
  pendingRfqsCount: number;
  responseRatePercent: number | null;
  avgResponseTimeHours: number | null;
  /** Window (days) of RFQs considered for response rate/speed. */
  responseWindowDays?: number;
  followerCount: number;
  totalProductsCount: number;
  totalSeeksCount: number;
  /** Weekly activity, oldest first; empty when the backend has none (e.g. mock mode). */
  weeklyTrend?: SellerTrendPoint[];
};

export type SellerTrendPoint = {
  /** ISO date of the week's Monday (UTC). */
  weekStart: string;
  seekViews: number;
  productViews: number;
  /** RFQs routed to this factory that week. */
  rfqs: number;
};

export type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  categoryId: string;
  priceInr: number;
  unit: string;
  moq: string;
  /** Active = visible to buyers; Paused = hidden by the seller (still editable). */
  status: "Active" | "Paused";
  /** Gallery in display order (first = imageUrl). */
  imageUrls: string[];
  datasheetUrl?: string;
  datasheetName?: string;
  viewsCount: number;
  inquiriesCount: number;
  specs: Record<string, string>;
  description: string;
  createdAt: string;
};

export type SellerSeek = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  inquiriesGenerated: number;
  taggedProductName?: string;
  category: string;
  createdAt: string;
  /** Paused = hidden from the buyer feed by the seller. */
  status: "Published" | "Processing" | "Paused";
  description: string;
  hashtags: string[];
  productIds: string[];
};

export type SellerRfq = {
  id: string;
  referenceNumber: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  buyerAvatarUrl?: string;
  productName: string;
  productCategory: string;
  /** The buyer sent this RFQ to this factory only (from its page, a seek or a product). */
  direct: boolean;
  /** It was sent while watching one of this factory's seeks. */
  fromSeek: boolean;
  quantityRequested: string;
  targetBudgetInr?: number;
  deliveryPort: string;
  /** From this factory's point of view: New = not quoted yet, Quoted = our quote sent, Closed = RFQ no longer open. */
  status: "New" | "Quoted" | "Closed";
  createdAt: string;
  requirements: string;
  quotedPriceInr?: number;
  leadTimeDays?: number;
  quoteIncoterm?: string;
  quoteNotes?: string;
};

export type SellerChatMessage = {
  id: string;
  sender: "seller" | "buyer";
  text: string;
  timestamp: string;
  attachmentType?: "product" | "quote" | "image";
  attachmentData?: {
    title: string;
    detail: string;
    price?: number;
  };
  /** Uploaded image/PDF. */
  attachment?: import("@/shared/api/contracts").MessageAttachment;
  /** The order this message is about, if the sender picked one. */
  order?: import("@/entities/message").MessageOrderContext;
};

export type SellerConversation = {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  buyerAvatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  relatedProduct?: string;
  status: "active" | "archived" | "lead";
  messages: SellerChatMessage[];
};

export type SellerFactoryProfile = {
  name: string;
  slug: string;
  logoUrl: string;
  coverUrl: string;
  country: string;
  location: string;
  yearsEstablished: number;
  factorySize: string;
  employees: string;
  annualTurnover?: string;
  exportCountries: string[];
  certifications: string[];
  certificates?: import("@/entities/factory-certificate").FactoryCertificate[];
  description: string;
  productionLines: number;
  verified: boolean;
  websiteUrl?: string;
  tier: string;
};
