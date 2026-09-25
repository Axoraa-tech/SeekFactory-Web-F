import type { Category } from "@/entities/category";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { AppNotification } from "@/entities/notification";
import type { Product } from "@/entities/product";
import type { FeedTab, Reel } from "@/entities/reel";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import type { RfqDraft, RfqItem } from "@/entities/rfq";
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
  url?: string;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  sender: "user" | "factory";
  text: string;
  time: string;
  attachment?: MessageAttachment;
  isRead?: boolean;
};

export interface MessageRepository {
  listRecent(limit?: number): Promise<(Conversation & { manufacturer: Manufacturer })[]>;
  getMessages(conversationId: string): Promise<MessageItem[]>;
  sendMessage(
    conversationId: string,
    text: string,
    attachment?: MessageAttachment
  ): Promise<MessageItem>;
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

export interface FactoryRepository {
  getProfile(): Promise<Manufacturer>;
  updateProfile(data: Partial<Manufacturer>): Promise<Manufacturer>;
  getStats(): Promise<SellerStats | null>;
  getProducts(): Promise<Product[]>;
  addProduct(data: {
    name: string;
    imageUrl: string;
    description?: string;
    priceInr: number;
    unit?: string;
    moq?: string;
    categoryId: string;
    specs?: Record<string, string>;
  }): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getSeeks(): Promise<Reel[]>;
  addSeek(data: {
    title: string;
    description?: string;
    posterUrl: string;
    videoUrl?: string;
    durationSec?: number;
    hashtags?: string[];
  }): Promise<Reel>;
  deleteSeek(id: string): Promise<void>;
  getRfqs(): Promise<RfqItem[]>;
  submitQuote(rfqId: string, quote: {
    quotePrice: number;
    currency?: string;
    leadTimeDays: number;
    notes?: string;
  }): Promise<void>;
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
}
