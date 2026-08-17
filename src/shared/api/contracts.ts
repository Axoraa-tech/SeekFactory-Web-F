import type { Category } from "@/entities/category";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import type { AppNotification } from "@/entities/notification";
import type { Product } from "@/entities/product";
import type { FeedTab, Reel } from "@/entities/reel";
import type { RfqDraft } from "@/entities/rfq";
import type { BuyerProfile } from "@/entities/user";
import type { JoinInput, LoginInput } from "@/features/auth/session-cookie";

export type FeedItem = {
  reel: Reel;
  manufacturer: Manufacturer;
  primaryProductSlug?: string;
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
}

export interface FeedRepository {
  list(tab: FeedTab): Promise<FeedItem[]>;
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
}

export interface MessageRepository {
  listRecent(limit?: number): Promise<(Conversation & { manufacturer: Manufacturer })[]>;
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
}

export interface RfqRepository {
  submit(draft: RfqDraft): Promise<{ ok: true; id: string }>;
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
}
