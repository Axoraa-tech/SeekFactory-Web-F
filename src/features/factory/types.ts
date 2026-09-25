export type SellerTab = "overview" | "products" | "seeks" | "rfqs" | "messages" | "profile";

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
  status: "Active" | "Under Review" | "Draft";
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
  status: "Published" | "Processing" | "Draft";
};

export type SellerRfq = {
  id: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  buyerAvatarUrl?: string;
  productName: string;
  productCategory: string;
  quantityRequested: string;
  targetBudgetInr?: number;
  deliveryPort: string;
  status: "New" | "Responded" | "Quoted" | "Under Review";
  createdAt: string;
  requirements: string;
  quotedPriceInr?: number;
  leadTimeDays?: number;
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
