export type SellerTab = "overview" | "products" | "seeks" | "rfqs" | "messages" | "profile";

export type SellerStats = {
  totalProductViews: number;
  productViewsChange: number; // e.g. +18.4%
  factoryProfileVisits: number;
  profileVisitsChange: number; // e.g. +12.1%
  videoSeekPlays: number;
  videoPlaysChange: number; // e.g. +34.2%
  activeRfqsCount: number;
  pendingRfqsCount: number;
  responseRatePercent: number;
  avgResponseTimeHours: number;
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
