import type { Category } from "@/entities/category";
import type { Conversation, MessageOrderContext } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { AppNotification } from "@/entities/notification";
import type { Product } from "@/entities/product";
import type { FeedTab, Reel } from "@/entities/reel";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import type { RfqDraft, RfqItem } from "@/entities/rfq";
import type { NewOrderRequest, OrderRequest, OrderStatus } from "@/entities/order";
import type { BuyerProfile } from "@/entities/user";
import type { JoinInput, LoginInput } from "@/features/auth/session-cookie";
import type { SellerStats } from "@/features/factory/types";

export type FeedItem = {
  reel: Reel;
  manufacturer: Manufacturer;
  primaryProductSlug?: string;
  products?: Product[];
};

export type ManufacturerDetail = {
  manufacturer: Manufacturer;
  products: Product[];
  reels: Reel[];
};

export type ProductDetail = {
  product: Product;
  manufacturer: Manufacturer;
};

export interface SessionRepository {
  getCurrentUser(): Promise<BuyerProfile | null>;
  join(input: JoinInput): Promise<BuyerProfile>;
  login(input: LoginInput): Promise<BuyerProfile>;
  logout(): Promise<void>;
  updateProfile(input: {
    name?: string;
    companyName?: string;
    industry?: string;
    country?: string;
    phone?: string;
  }): Promise<BuyerProfile>;
}

export interface FeedRepository {
  list(tab: FeedTab): Promise<FeedItem[]>;
  addReel(reel: Reel): Promise<void>;
  likeReel(reelId: string): Promise<{ liked: boolean; likesCount: number }>;
  saveReel(reelId: string): Promise<{ saved: boolean; savesCount: number }>;
  /** Seek impression for seller analytics; viewerId dedupes guests. Never throws for tracking failures. */
  recordView(reelId: string, viewerId?: string): Promise<void>;
}

export interface ManufacturerRepository {
  listVerified(limit?: number): Promise<Manufacturer[]>;
  getBySlug(slug: string): Promise<ManufacturerDetail | null>;
  listAll(): Promise<Manufacturer[]>;
}

export interface ProductRepository {
  listTrending(limit?: number): Promise<Product[]>;
  getBySlug(slug: string): Promise<ProductDetail | null>;
  listByCategory(categoryId: string): Promise<Product[]>;
  addProduct(product: Product): Promise<void>;
  /** Product detail view for seller analytics; viewerId dedupes guests. Never throws for tracking failures. */
  recordView(productId: string, viewerId?: string): Promise<void>;
}

export type MessageAttachment = {
  name: string;
  size: string;
  /** Backend path (e.g. /api/v1/conversations/{id}/attachments/{key}); use attachmentHref() to display. */
  url?: string;
  /** image/png, image/jpeg, application/pdf, ... */
  contentType?: string;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: MessageAttachment;
  /** The order this message is about, if the sender picked one. */
  order?: MessageOrderContext;
  isRead?: boolean;
};

export interface MessageRepository {
  listRecent(limit?: number): Promise<(Conversation & { manufacturer: Manufacturer })[]>;
  getMessages(conversationId: string): Promise<MessageItem[]>;
  sendMessage(
    conversationId: string,
    text: string,
    attachment?: MessageAttachment,
    context?: { orderId?: string }
  ): Promise<MessageItem>;
  /** Upload an image/PDF to this conversation; pass the result to sendMessage. */
  uploadAttachment(conversationId: string, file: File): Promise<MessageAttachment>;
  /** Orders between this conversation's buyer and factory (for the context picker). */
  listConversationOrders(conversationId: string): Promise<OrderRequest[]>;
  startConversation(manufacturerId: string, initialMessage?: string): Promise<Conversation & { manufacturer: Manufacturer }>;
  markAsRead(conversationId: string): Promise<void>;
  onMessageStream(conversationId: string, callback: (message: MessageItem) => void): () => void;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  listRoots(): Promise<Category[]>;
  listChildren(parentIdOrSlug: string): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
}

export interface NotificationRepository {
  list(): Promise<AppNotification[]>;
  unreadCount(): Promise<number>;
  markAllAsRead(): Promise<void>;
  markAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}

export interface RfqRepository {
  submit(draft: RfqDraft): Promise<{ ok: true; id: string; referenceNumber?: string }>;
  listMyRfqs(): Promise<RfqItem[]>;
}

export interface CommentRepository {
  listByReelId(reelId: string): Promise<ReelComment[]>;
  addComment(reelId: string, content: string, user?: { name: string; avatarUrl: string; companyName?: string }): Promise<ReelComment>;
  addReply(commentId: string, content: string, user?: { name: string; avatarUrl: string; companyName?: string }): Promise<ReelCommentReply>;
}

/** document = PDF (product datasheets). */
export type MediaKind = "image" | "video" | "document";

export type UploadedMedia = {
  url: string;
  contentType: string;
  size: number;
};

export type NewFactoryProduct = {
  name: string;
  imageUrl: string;
  description?: string;
  priceInr: number;
  unit?: string;
  moq?: string;
  categoryId: string;
  specs?: Record<string, string>;
  /** Full gallery (max 8); the first entry becomes the cover. */
  imageUrls?: string[];
  datasheetUrl?: string;
  datasheetName?: string;
};

/** Partial product edit; omitted fields stay unchanged. datasheetUrl "" removes the datasheet. */
export type FactoryProductUpdate = Partial<Omit<NewFactoryProduct, "imageUrl">>;

/** Partial seek edit; omitted fields stay unchanged. */
export type FactorySeekUpdate = Partial<Omit<NewFactorySeek, "categoryIds">>;

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** The seller's own verification application (private: holds tax/registration ids). */
export type FactoryVerification = {
  status: VerificationStatus;
  submitted: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  companyRegNumber?: string;
  taxId?: string;
  registrationDate?: string;
  factoryAddress?: string;
  certifications: string[];
};

export type VerificationSubmission = {
  companyRegNumber: string;
  taxId?: string;
  registrationDate?: string;
  country?: string;
  factoryAddress: string;
  certifications: string[];
};

export type NewFactorySeek = {
  title: string;
  description?: string;
  posterUrl: string;
  videoUrl?: string;
  durationSec?: number;
  hashtags?: string[];
  productIds?: string[];
  categoryIds?: string[];
};

export type FactoryQuote = {
  quotePrice: number;
  currency?: string;
  leadTimeDays: number;
  incoterm?: string;
  notes?: string;
};

export interface FactoryRepository {
  getProfile(): Promise<Manufacturer>;
  updateProfile(data: Partial<Manufacturer>): Promise<Manufacturer>;
  getStats(): Promise<SellerStats | null>;
  /** Browser-only: uploads a device file and returns a URL usable in addProduct/addSeek/profile. */
  uploadMedia(file: File, kind: MediaKind): Promise<UploadedMedia>;
  getProducts(): Promise<Product[]>;
  addProduct(data: NewFactoryProduct): Promise<Product>;
  updateProduct(id: string, data: FactoryProductUpdate): Promise<Product>;
  /** Pause (false) hides the product from buyers without deleting it. */
  setProductListed(id: string, listed: boolean): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getSeeks(): Promise<Reel[]>;
  addSeek(data: NewFactorySeek): Promise<Reel>;
  updateSeek(id: string, data: FactorySeekUpdate): Promise<Reel>;
  setSeekListed(id: string, listed: boolean): Promise<Reel>;
  deleteSeek(id: string): Promise<void>;
  getVerification(): Promise<FactoryVerification>;
  submitVerification(data: VerificationSubmission): Promise<FactoryVerification>;
  /** Open (or reuse) the chat with the buyer who posted an RFQ. */
  openRfqConversation(rfqId: string): Promise<Conversation>;
  getRfqs(): Promise<RfqItem[]>;
  submitQuote(rfqId: string, quote: FactoryQuote): Promise<void>;
  /** Order requests received by this factory (includes buyer contact details). */
  getOrders(): Promise<OrderRequest[]>;
  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<OrderRequest>;
  /** Open (or reuse) the chat with an order's buyer; returns the conversation (seller view). */
  openOrderConversation(orderId: string): Promise<Conversation>;
}

/** Buyer side of order requests. No payment: the factory is notified and follows up. */
export interface OrderRepository {
  place(input: NewOrderRequest): Promise<OrderRequest>;
  listMine(): Promise<OrderRequest[]>;
}

/** Password and email-verification flows (buyers and suppliers). */
export interface AccountRepository {
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  /** Always resolves the same way whether or not the email has an account. */
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

export interface ApiClient {
  session: SessionRepository;
  feed: FeedRepository;
  manufacturers: ManufacturerRepository;
  products: ProductRepository;
  messages: MessageRepository;
  categories: CategoryRepository;
  notifications: NotificationRepository;
  rfq: RfqRepository;
  comments: CommentRepository;
  factory: FactoryRepository;
  orders: OrderRepository;
  account: AccountRepository;
}
