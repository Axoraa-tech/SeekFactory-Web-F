import type {
  ApiClient,
  CategoryRepository,
  CommentRepository,
  FeedRepository,
  ManufacturerDetail,
  ManufacturerRepository,
  MessageRepository,
  MessageAttachment,
  NotificationRepository,
  ProductDetail,
  ProductRepository,
  RfqRepository,
  SessionRepository,
  FactoryQuote,
  FactoryRepository,
  MediaKind,
  MessageItem,
  NewFactoryProduct,
  NewFactorySeek,
  OrderRepository,
  SignInResult,
  UploadedMedia,
  AccountRepository,
  FactoryProductUpdate,
  FactorySeekUpdate,
  FactoryVerification,
  VerificationSubmission,
  SearchRepository,
  SearchResult,
  MediaRepository,
  PlatformRepository,
  FeedItem,
  UploadKind,
} from "@/shared/api/contracts";
import type { CartItem } from "@/entities/order";
import type { BuyerPlan, ExchangeRates } from "@/entities/plan";
import type { NotificationType } from "@/entities/notification";
import type { PriceTier } from "@/entities/product";
import type { RfqQuote } from "@/entities/rfq";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import type { Category, CategoryIconKey } from "@/entities/category";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import type { FeedTab, Reel } from "@/entities/reel";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { AppNotification } from "@/entities/notification";
import type { Conversation } from "@/entities/message";
import type { RfqDraft, RfqItem } from "@/entities/rfq";
import type { Cart, NewOrderRequest, OrderContact, OrderParty, OrderRequest, OrderStatus } from "@/entities/order";
import type { BuyerPlanTier, BuyerProfile } from "@/entities/user";
import type { SellerStats } from "@/features/factory/types";
import {
  clearBrowserCookie,
  readBrowserCookie,
  writeBrowserCookie,
  type JoinInput,
  type LoginInput,
  type SessionPayload,
} from "@/features/auth/session-cookie";

/** Error from the backend, carrying the HTTP status so callers can tell "not found" from "down". */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** Shown for missing product, factory and seek imagery instead of invented stock photos. */
export const PLACEHOLDER_IMAGE = "/placeholders/image.svg";

/**
 * Standard Backend Envelope Response
 */
type BackendResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
};

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  companyName?: string;
  industry?: string;
  country?: string;
  avatar_url?: string;
  avatarUrl?: string;
  phone?: string;
  emailVerified?: boolean;
  taxId?: string;
  address?: string;
  plan?: string;
  memberSince?: string;
}

interface BackendAuthResponse {
  /** True on the account's first sign-in (sign-up included). */
  firstLogin?: boolean;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenType?: string;
  token_type?: string;
  expiresIn?: number;
  expires_in?: number;
  userId?: string;
  user_id?: string;
  name?: string;
  email?: string;
  role?: string;
  companyName?: string;
  company_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  user?: BackendUser;
}


interface BackendReel {
  id: string;
  manufacturer_id?: string;
  manufacturerId?: string;
  title?: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  poster_url?: string;
  posterUrl?: string;
  video_url?: string;
  videoUrl?: string;
  duration_sec?: number;
  durationSec?: number;
  start_sec?: number;
  startSec?: number;
  views?: number;
  likes?: number;
  likes_count?: number;
  likesCount?: number;
  comments?: number;
  comments_count?: number;
  commentsCount?: number;
  shares?: number;
  saves?: number;
  saves_count?: number;
  savesCount?: number;
  product_ids?: string[];
  productIds?: string[];
  listed?: boolean;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

interface BackendProduct {
  id?: string;
  slug?: string;
  manufacturer_id?: string;
  manufacturerId?: string;
  manufacturer?: BackendManufacturer;
  name?: string;
  primary_image_url?: string;
  primaryImageUrl?: string;
  image_url?: string;
  imageUrl?: string;
  description?: string;
  price_inr?: number;
  priceInr?: number;
  unit?: string;
  moq?: number | string;
  category_id?: string;
  categoryId?: string;
  specs?: Record<string, string>;
  imageUrls?: string[];
  datasheetUrl?: string;
  datasheetName?: string;
  listed?: boolean;
  priceTiers?: PriceTier[];
  savedByMe?: boolean;
}

interface BackendManufacturer {
  id?: string;
  slug?: string;
  name?: string;
  logo_url?: string;
  logoUrl?: string;
  cover_url?: string;
  coverUrl?: string;
  country?: string;
  location?: string;
  verified?: boolean;
  premium?: boolean;
  years_established?: number;
  yearsEstablished?: number;
  factory_size?: string;
  factorySize?: string;
  employees?: string;
  export_countries?: string[];
  exportCountries?: string[];
  description?: string;
  follower_count?: number;
  followerCount?: number;
  category_ids?: string[];
  categoryIds?: string[];
  chairman_name?: string;
  chairmanName?: string;
  website_url?: string;
  websiteUrl?: string;
  annual_turnover?: string;
  annualTurnover?: string;
  certifications?: string[];
  production_lines?: number;
  productionLines?: number;
  certificates?: FactoryCertificate[];
  products?: BackendProduct[];
  reels?: BackendReel[];
}

interface BackendFeedItem {
  reel: BackendReel;
  manufacturer: BackendManufacturer;
  primary_product_slug?: string;
  primaryProductSlug?: string;
  products?: BackendProduct[];
  followingManufacturer?: boolean;
}

interface BackendCategory {
  id?: string;
  slug?: string;
  name?: string;
  icon?: string;
  parent_id?: string | null;
  listing_count?: number;
  parentId?: string | null;
  listingCount?: number;
}

interface BackendCommentReply {
  id: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorCompany?: string;
  authorCountry?: string;
  verified?: boolean;
  isVerified?: boolean;
  content: string;
  createdAt?: string;
  likes?: number;
  likedByMe?: boolean;
}

interface BackendComment extends BackendCommentReply {
  reelId?: string;
  replies?: BackendCommentReply[];
}

interface BackendConversation {
  id: string;
  manufacturer_id?: string;
  manufacturerId?: string;
  manufacturer?: BackendManufacturer;
  buyerId?: string;
  buyer_id?: string;
  buyerName?: string;
  buyer_name?: string;
  buyerCompany?: string;
  buyer_company?: string;
  buyerAvatarUrl?: string;
  buyer_avatar_url?: string;
  unread_count?: number;
  unreadCount?: number;
  last_message?: string | {
    id?: string;
    content?: string;
    sent_at?: string;
  };
  lastMessage?: string;
  last_message_at?: string;
  lastMessageAt?: string;
}

interface BackendMessage {
  attachmentContentType?: string;
  order?: {
    id: string;
    referenceNumber?: string;
    productName?: string;
    productSlug?: string;
    quantity?: number;
    unit?: string;
    status?: string;
  };
  id: string;
  conversation_id?: string;
  conversationId?: string;
  sender_id?: string;
  senderId?: string;
  sender_type?: string;
  senderType?: string;
  sender_name?: string;
  senderName?: string;
  sender_avatar_url?: string;
  senderAvatarUrl?: string;
  message_text?: string;
  messageText?: string;
  attachment_name?: string;
  attachmentName?: string;
  attachment_size?: string;
  attachmentSize?: string;
  attachment_url?: string;
  attachmentUrl?: string;
  is_read?: boolean;
  isRead?: boolean;
  created_at?: string;
  createdAt?: string;
}

interface BackendNotification {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  read?: boolean;
  createdAt?: string;
  referenceId?: string;
}

interface BackendRfq {
  id: string;
  referenceNumber?: string;
  productName?: string;
  categoryId?: string;
  quantity?: string;
  unit?: string;
  targetPrice?: string;
  currency?: string;
  incoterm?: string;
  companyName?: string;
  details?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status?: string;
  createdAt?: string;
  quoteCount?: number;
  quotes?: {
    id: string;
    manufacturer?: BackendManufacturer;
    quotePrice?: number;
    currency?: string;
    leadTimeDays?: number;
    notes?: string;
    attachmentUrl?: string;
    status?: string;
    createdAt?: string;
    orderId?: string;
  }[];
}

interface BackendCartItem {
  id: string;
  product: BackendProduct;
  manufacturer: BackendManufacturer;
  quantity: number;
  minQuantity?: number;
  unitPrice?: number | null;
  lineTotal?: number | null;
}

interface BackendCart {
  items?: BackendCartItem[];
  itemCount?: number;
  totalAmount?: number;
  currency?: string;
}

interface BackendFactoryStats {
  weeklyTrend?: { weekStart: string; seekViews?: number; productViews?: number; rfqs?: number }[];
  periodDays?: number;
  responseWindowDays?: number;
  total_product_views?: number;
  totalProductViews?: number;
  product_views_change?: number;
  productViewsChange?: number;
  factory_profile_visits?: number;
  factoryProfileVisits?: number;
  profile_visits_change?: number;
  profileVisitsChange?: number;
  video_seek_plays?: number;
  videoSeekPlays?: number;
  video_plays_change?: number;
  videoPlaysChange?: number;
  active_rfqs_count?: number;
  activeRfqsCount?: number;
  pending_rfqs_count?: number;
  pendingRfqsCount?: number;
  response_rate_percent?: number;
  responseRatePercent?: number;
  avg_response_time_hours?: number;
  avgResponseTimeHours?: number;
  follower_count?: number;
  followerCount?: number;
  total_products_count?: number;
  totalProductsCount?: number;
  total_seeks_count?: number;
  totalSeeksCount?: number;
}

/**
 * Production-ready HTTP ApiClient connecting Next.js to Spring Boot.
 */
export function createHttpApi(baseUrl: string): ApiClient {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  // Request Memoization Cache to prevent duplicate GET requests
  const pendingRequests = new Map<string, Promise<unknown>>();

  /**
   * Helper to get JWT auth header from cookie on client or server
   */
  async function getAuthHeaders(): Promise<Record<string, string>> {
    let token: string | undefined;

    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const jar = await cookies();
        token = jar.get("sf-access-token")?.value;
      } catch {
        // Fallback for non-cookie server contexts
      }
    } else {
      // Client-side requests go to /api/proxy, browser sends HttpOnly cookies automatically
      token = undefined;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic JSON request wrapper with error handling
   */
  async function fetchJson<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isGet = !options.method || options.method.toUpperCase() === "GET";
    const cacheKey = isGet ? endpoint : null;

    if (cacheKey && pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      const defaultHeaders = await getAuthHeaders();
      // Route browser requests through our secure proxy, server requests go direct
      let url = typeof window !== "undefined" ? `/api/proxy${endpoint}` : `${cleanBaseUrl}${endpoint}`;
      
      // Fix Node 18+ IPv6 localhost resolution bug causing ECONNREFUSED
      if (typeof window === "undefined") {
        url = url.replace("localhost", "127.0.0.1");
      }

      // Multipart bodies must let fetch set Content-Type with the boundary.
      if (options.body instanceof FormData) {
        delete defaultHeaders["Content-Type"];
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      });

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status} on ${endpoint}`;
        try {
          const errJson = (await res.json()) as { message?: string; error?: string; errors?: Record<string, string> };
          if (errJson.errors && typeof errJson.errors === "object" && Object.keys(errJson.errors).length > 0) {
            errorMsg = Object.values(errJson.errors).join(", ");
          } else {
            errorMsg = errJson.message || errJson.error || errorMsg;
          }
        } catch {
          // Response was not JSON
        }
        throw new ApiError(errorMsg, res.status);
      }

      const text = await res.text();
      if (!text) return undefined as T;
      const json = JSON.parse(text) as BackendResponse<T>;
      return json.data;
    })();

    if (cacheKey) {
      pendingRequests.set(cacheKey, requestPromise);
      requestPromise.finally(() => {
        setTimeout(() => {
          pendingRequests.delete(cacheKey);
        }, 1500);
      }).catch(() => {}); // Prevent UnhandledPromiseRejection from the finally chain
    }

    return requestPromise;
  }

  // ── 1. SESSION REPOSITORY ──────────────────────────────────────
  /** Display-only session cookie; the credential itself lives in the HttpOnly sf-access-token cookie. */
  function rememberSession(res: BackendAuthResponse) {
    const sessionData: SessionPayload = {
      id: res.user?.id || res.userId || res.user_id || "",
      name: res.user?.name || res.name || "",
      role: mapBackendRole(res.user?.role || res.role),
      email: res.user?.email || res.email || "",
      companyName: res.user?.companyName || res.user?.company_name || res.companyName || res.company_name || "",
    };
    writeBrowserCookie(sessionData);
  }

  const session: SessionRepository = {
    async getCurrentUser(): Promise<BuyerProfile | null> {
      try {
        const user = await fetchJson<BackendUser>("/api/v1/auth/me", { cache: "no-store" });
        return user ? toProfile(user) : null;
      } catch {
        // Signed out, or the access token expired and could not be refreshed
        return null;
      }
    },

    async join(input: JoinInput): Promise<SignInResult> {
      if (!input.password) throw new Error("Password is required");
      const res = await fetchJson<BackendAuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: input.name || input.email?.split("@")[0],
          email: input.email,
          password: input.password,
          role: input.role === "Supplier" ? "SUPPLIER" : "BUYER",
          companyName: input.companyName,
          industry: input.industry,
          country: input.country,
          phone: input.phone,
        }),
      });
      rememberSession(res);
      const profile = (await session.getCurrentUser()) ?? authResponseToProfile(res);
      return { ...profile, firstLogin: res.firstLogin === true };
    },

    async login(input: LoginInput): Promise<SignInResult> {
      const res =
        input.method === "phone" && input.phone
          ? await fetchJson<BackendAuthResponse>("/api/v1/auth/login/phone", {
              method: "POST",
              body: JSON.stringify({ phone: input.phone, otp: input.otp, role: input.role, companyName: input.companyName }),
            })
          : await fetchJson<BackendAuthResponse>("/api/v1/auth/login", {
              method: "POST",
              body: JSON.stringify({ email: input.email, password: input.password }),
            });
      rememberSession(res);
      const profile = (await session.getCurrentUser()) ?? authResponseToProfile(res);
      return { ...profile, firstLogin: res.firstLogin === true };
    },

    async logout(): Promise<void> {
      try {
        await fetchJson<void>("/api/v1/auth/logout", { method: "POST" });
      } catch {
        // The proxy clears the auth cookies either way
      } finally {
        clearBrowserCookie();
      }
    },

    async updateProfile(input): Promise<BuyerProfile> {
      const updated = await fetchJson<BackendUser>("/api/v1/users/me", {
        method: "PUT",
        body: JSON.stringify({ ...input, avatarUrl: toStoredMediaUrl(input.avatarUrl) }),
      });
      const profile = toProfile(updated);
      if (typeof window !== "undefined") {
        const current = readBrowserCookie();
        if (current) writeBrowserCookie({ ...current, name: profile.name, companyName: profile.companyName });
      }
      return profile;
    },

    async updatePlan(plan: BuyerPlanTier): Promise<BuyerProfile> {
      const updated = await fetchJson<BackendUser>("/api/v1/users/me/plan", {
        method: "PUT",
        body: JSON.stringify({ plan }),
      });
      return toProfile(updated);
    },
  };

  // ── 2. FEED REPOSITORY ─────────────────────────────────────────
  const feed: FeedRepository = {
    async list(tab: FeedTab) {
      const data = await fetchJson<BackendFeedItem[]>(`/api/v1/feed?tab=${tab}`, { cache: "no-store" });
      return data.map((item) => normalizeFeedItem(item, tab));
    },

    async addReel(): Promise<void> {
      // Seeks are published from the seller hub (factory.addSeek); the public feed is read-only.
      throw new Error("Use factory.addSeek to publish a seek");
    },

    async likeReel(reelId: string) {
      return fetchJson<{ liked: boolean; likesCount: number }>(`/api/v1/feed/${encodeURIComponent(reelId)}/like`, {
        method: "POST",
      });
    },

    async saveReel(reelId: string) {
      return fetchJson<{ saved: boolean; savesCount: number }>(`/api/v1/feed/${encodeURIComponent(reelId)}/save`, {
        method: "POST",
      });
    },

    async shareReel(reelId: string) {
      return fetchJson<{ sharesCount: number }>(`/api/v1/feed/${encodeURIComponent(reelId)}/share`, {
        method: "POST",
      });
    },

    async listSaved(): Promise<FeedItem[]> {
      const data = await fetchJson<BackendFeedItem[]>("/api/v1/users/me/saved/seeks", { cache: "no-store" });
      return data.map((item) => normalizeFeedItem(item));
    },

    async recordView(reelId: string, viewerId?: string): Promise<void> {
      try {
        await fetchJson<unknown>(`/api/v1/feed/${encodeURIComponent(reelId)}/view`, {
          method: "POST",
          body: JSON.stringify({ viewerId }),
        });
      } catch {
        // Analytics must never break playback
      }
    },
  };

  // ── 3. MANUFACTURER REPOSITORY ─────────────────────────────────
  const manufacturers: ManufacturerRepository = {
    async listAll(): Promise<Manufacturer[]> {
      const list = await fetchJson<BackendManufacturer[]>("/api/v1/manufacturers");
      return list.map(normalizeManufacturer);
    },

    async listVerified(limit = 20): Promise<Manufacturer[]> {
      const list = await fetchJson<BackendManufacturer[]>(`/api/v1/manufacturers/verified?limit=${limit}`);
      return list.map(normalizeManufacturer);
    },

    async getBySlug(slug: string): Promise<ManufacturerDetail | null> {
      try {
        const detail = await fetchJson<{
          manufacturer: BackendManufacturer;
          products?: BackendProduct[];
          reels?: BackendReel[];
          certifications?: string[];
          responseRatePercent?: number;
          avgResponseTimeHours?: number;
          followedByMe?: boolean;
        }>(`/api/v1/manufacturers/${encodeURIComponent(slug)}`, { cache: "no-store" });
        return {
          manufacturer: normalizeManufacturer(detail.manufacturer),
          products: (detail.products || []).map(normalizeProduct),
          reels: (detail.reels || []).map((r) => normalizeReel(r, detail.manufacturer.id)),
          certifications: detail.certifications || [],
          responseRatePercent: detail.responseRatePercent ?? null,
          avgResponseTimeHours: detail.avgResponseTimeHours ?? null,
          followedByMe: detail.followedByMe,
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },

    async toggleFollow(manufacturerId: string) {
      return fetchJson<{ following: boolean; followerCount: number }>(
        `/api/v1/manufacturers/${encodeURIComponent(manufacturerId)}/follow`,
        { method: "POST" },
      );
    },

    async listFollowing(): Promise<Manufacturer[]> {
      const list = await fetchJson<BackendManufacturer[]>("/api/v1/users/me/following", { cache: "no-store" });
      return list.map(normalizeManufacturer);
    },
  };

  // ── 4. PRODUCT REPOSITORY ──────────────────────────────────────
  const products: ProductRepository = {
    async listTrending(limit = 20): Promise<Product[]> {
      const list = await fetchJson<BackendProduct[]>(`/api/v1/products/trending?limit=${limit}`);
      return list.map(normalizeProduct);
    },

    async getBySlug(slug: string): Promise<ProductDetail | null> {
      try {
        const detail = await fetchJson<{
          product: BackendProduct;
          manufacturer: BackendManufacturer;
          related?: BackendProduct[];
        }>(`/api/v1/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
        return {
          product: normalizeProduct(detail.product),
          manufacturer: normalizeManufacturer(detail.manufacturer),
          related: (detail.related || []).map(normalizeProduct),
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },

    async listByCategory(categoryId: string): Promise<Product[]> {
      const list = await fetchJson<BackendProduct[]>(`/api/v1/products/category/${encodeURIComponent(categoryId)}`);
      return list.map(normalizeProduct);
    },

    async toggleSave(productId: string) {
      return fetchJson<{ saved: boolean }>(`/api/v1/products/${encodeURIComponent(productId)}/save`, { method: "POST" });
    },

    async listSaved(): Promise<Product[]> {
      const list = await fetchJson<BackendProduct[]>("/api/v1/users/me/saved/products", { cache: "no-store" });
      return list.map(normalizeProduct);
    },

    async recordView(productId: string, viewerId?: string): Promise<void> {
      try {
        await fetchJson<unknown>(`/api/v1/products/${encodeURIComponent(productId)}/view`, {
          method: "POST",
          body: JSON.stringify({ viewerId }),
        });
      } catch {
        // Analytics must never break the product page
      }
    },

    async addProduct(): Promise<void> {
      // Products are created from the seller hub (factory.addProduct).
      throw new Error("Use factory.addProduct to list a product");
    },
  };

  // ── 5. CATEGORY REPOSITORY ─────────────────────────────────────
  const categories: CategoryRepository = {
    async list(): Promise<Category[]> {
      const list = await fetchJson<BackendCategory[]>("/api/v1/categories");
      return list.map(normalizeCategory);
    },

    async listRoots(): Promise<Category[]> {
      const list = await fetchJson<BackendCategory[]>("/api/v1/categories/roots");
      return list.map(normalizeCategory);
    },

    async listChildren(slug: string): Promise<Category[]> {
      try {
        const list = await fetchJson<BackendCategory[]>(`/api/v1/categories/${slug}/children`);
        return list.map(normalizeCategory);
      } catch {
        return [];
      }
    },

    async getBySlug(slug: string): Promise<Category | null> {
      try {
        const cat = await fetchJson<BackendCategory>(`/api/v1/categories/${slug}`);
        return normalizeCategory(cat);
      } catch {
        return null;
      }
    },
  };

  // ── 6. RFQ REPOSITORY ──────────────────────────────────────────
  const rfq: RfqRepository = {
    async submit(draft: RfqDraft): Promise<{ ok: true; id: string; referenceNumber?: string }> {
      const result = await fetchJson<{ ok: boolean; id: string; referenceNumber?: string }>("/api/v1/rfqs", {
        method: "POST",
        body: JSON.stringify({
          productName: draft.productName,
          categoryId: draft.categoryId,
          quantity: draft.quantity,
          unit: draft.unit,
          targetPrice: draft.targetPrice,
          currency: draft.currency,
          incoterm: draft.incoterm,
          companyName: draft.companyName,
          details: draft.details,
          attachmentName: draft.attachmentName,
          attachmentSize: draft.attachmentSize,
          attachmentUrl: toStoredMediaUrl(draft.attachmentUrl),
        }),
      });
      return { ok: true, id: result.id, referenceNumber: result.referenceNumber };
    },

    async listMyRfqs(): Promise<RfqItem[]> {
      const list = await fetchJson<BackendRfq[]>("/api/v1/rfqs", { cache: "no-store" });
      return list.map(normalizeRfq);
    },

    async getMine(rfqId: string): Promise<RfqItem> {
      return normalizeRfq(await fetchJson<BackendRfq>(`/api/v1/rfqs/${encodeURIComponent(rfqId)}`, { cache: "no-store" }));
    },

    async cancel(rfqId: string): Promise<RfqItem> {
      return normalizeRfq(await fetchJson<BackendRfq>(`/api/v1/rfqs/${encodeURIComponent(rfqId)}/cancel`, { method: "PUT" }));
    },

    async acceptQuote(rfqId, quoteId, contact): Promise<RfqItem> {
      return normalizeRfq(
        await fetchJson<BackendRfq>(
          `/api/v1/rfqs/${encodeURIComponent(rfqId)}/quotes/${encodeURIComponent(quoteId)}/accept`,
          { method: "POST", body: JSON.stringify(contact) },
        ),
      );
    },

    async rejectQuote(rfqId, quoteId): Promise<RfqItem> {
      return normalizeRfq(
        await fetchJson<BackendRfq>(
          `/api/v1/rfqs/${encodeURIComponent(rfqId)}/quotes/${encodeURIComponent(quoteId)}/reject`,
          { method: "POST" },
        ),
      );
    },
  };

  // ── 7. COMMENT REPOSITORY ──────────────────────────────────────
  const comments: CommentRepository = {
    async listByReelId(reelId: string): Promise<ReelComment[]> {
      const list = await fetchJson<BackendComment[]>(`/api/v1/reels/${encodeURIComponent(reelId)}/comments`, {
        cache: "no-store",
      });
      return list.map((c) => normalizeComment(c, reelId));
    },

    async addComment(reelId: string, content: string): Promise<ReelComment> {
      const res = await fetchJson<BackendComment>(`/api/v1/reels/${encodeURIComponent(reelId)}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      return normalizeComment(res, reelId);
    },

    async addReply(commentId: string, content: string): Promise<ReelCommentReply> {
      const res = await fetchJson<BackendCommentReply>(`/api/v1/comments/${encodeURIComponent(commentId)}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      return normalizeReply(res);
    },

    async toggleLike(commentId: string) {
      return fetchJson<{ liked: boolean; likes: number }>(`/api/v1/comments/${encodeURIComponent(commentId)}/like`, {
        method: "POST",
      });
    },
  };

  // ── 8. MESSAGE REPOSITORY ──────────────────────────────────────
  const messages: MessageRepository = {
    async listRecent(limit = 20): Promise<(Conversation & { manufacturer: Manufacturer })[]> {
      try {
        const list = await fetchJson<BackendConversation[]>(`/api/v1/conversations?limit=${limit}`);
        return list.map((item) => {
          let lastMsg = "";
          if (typeof item.lastMessage === "string") {
            lastMsg = item.lastMessage;
          } else if (typeof item.last_message === "string") {
            lastMsg = item.last_message;
          } else if (item.last_message && typeof item.last_message === "object") {
            lastMsg = item.last_message.content || "";
          }

          const lastAt = item.lastMessageAt || item.last_message_at ||
            (typeof item.last_message === "object" ? item.last_message?.sent_at : null) ||
            "";

          return {
            id: item.id,
            manufacturerId: item.manufacturerId || item.manufacturer?.id || "",
            buyerId: item.buyerId,
            buyerName: item.buyerName,
            buyerCompany: item.buyerCompany,
            buyerAvatarUrl: resolveMediaUrl(item.buyerAvatarUrl),
            lastMessage: lastMsg,
            lastMessageAt: lastAt,
            unreadCount: item.unreadCount ?? item.unread_count ?? 0,
            manufacturer: normalizeManufacturer(item.manufacturer || {}),
          };
        });
      } catch (err) {
        // Guests have no conversations; anything else is a real failure
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return [];
        throw err;
      }
    },

    async getMessages(conversationId: string) {
      try {
        const list = await fetchJson<BackendMessage[]>(`/api/v1/conversations/${conversationId}/messages`, {
          cache: "no-store",
        });
        return list.map((m) => normalizeMessage(m, conversationId));
      } catch {
        return [];
      }
    },

    async sendMessage(
      conversationId: string,
      text: string,
      attachment?: MessageAttachment,
      context?: { orderId?: string }
    ) {
      const payload = {
        messageText: text,
        attachmentName: attachment?.name,
        attachmentSize: attachment?.size,
        attachmentUrl: attachment?.url,
        orderId: context?.orderId,
      };

      const m = await fetchJson<BackendMessage>(`/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return normalizeMessage(m, conversationId);
    },

    async uploadAttachment(conversationId: string, file: File): Promise<MessageAttachment> {
      const body = new FormData();
      body.append("file", file);
      const res = await fetchJson<{ url: string; name?: string; size?: string; contentType?: string }>(
        `/api/v1/conversations/${encodeURIComponent(conversationId)}/attachments`,
        { method: "POST", body },
      );
      return { url: res.url, name: res.name || file.name, size: res.size || "", contentType: res.contentType || file.type };
    },

    async listConversationOrders(conversationId: string): Promise<OrderRequest[]> {
      try {
        const list = await fetchJson<BackendOrder[]>(
          `/api/v1/conversations/${encodeURIComponent(conversationId)}/orders`,
          { cache: "no-store" },
        );
        return list.map(normalizeOrder);
      } catch {
        return [];
      }
    },

    async startConversation(manufacturerId: string, initialMessage?: string): Promise<Conversation & { manufacturer: Manufacturer }> {
      const payload = {
        manufacturerId,
        initialMessage,
      };

      const item = await fetchJson<BackendConversation>("/api/v1/conversations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        id: item.id,
        manufacturerId: item.manufacturerId || item.manufacturer?.id || manufacturerId,
        lastMessage: item.lastMessage || (typeof item.last_message === "string" ? item.last_message : item.last_message?.content || ""),
        lastMessageAt: item.lastMessageAt || item.last_message_at || "",
        unreadCount: item.unreadCount ?? item.unread_count ?? 0,
        manufacturer: normalizeManufacturer(item.manufacturer || {}),
      };
    },

    async markAsRead(conversationId: string): Promise<void> {
      try {
        await fetchJson<void>(`/api/v1/conversations/${conversationId}/read`, {
          method: "PUT",
        });
      } catch {
        // Safe ignore
      }
    },

    onMessageStream(conversationId: string, callback: (message: MessageItem) => void): () => void {
      if (typeof window === "undefined") return () => {};
      
      // Same-origin via the proxy so the HttpOnly session cookie is attached
      const evtSource = new EventSource(`/api/proxy/api/v1/conversations/${encodeURIComponent(conversationId)}/stream`);
      
      evtSource.addEventListener("message", (event) => {
        try {
          const m: BackendMessage = JSON.parse(event.data);
          callback(normalizeMessage(m, conversationId));
        } catch (e) {
          console.error("Failed to parse SSE message", e);
        }
      });
      
      return () => {
        evtSource.close();
      };
    },
  };

  // ── 9. NOTIFICATION REPOSITORY ─────────────────────────────────
  const notifications: NotificationRepository = {
    async list(): Promise<AppNotification[]> {
      try {
        const list = await fetchJson<BackendNotification[]>("/api/v1/notifications", { cache: "no-store" });
        return list.map(normalizeNotification);
      } catch (err) {
        // Guests have no notifications; anything else is a real failure
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return [];
        throw err;
      }
    },

    async unreadCount(): Promise<number> {
      try {
        const res = await fetchJson<{ count: number }>("/api/v1/notifications/unread-count", { cache: "no-store" });
        return res.count || 0;
      } catch {
        // Badge only: never break the page shell over it
        return 0;
      }
    },

    async markAllAsRead(): Promise<void> {
      await fetchJson<void>("/api/v1/notifications/mark-read", { method: "PUT" });
    },

    async markAsRead(id: string): Promise<void> {
      await fetchJson<void>(`/api/v1/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" });
    },

    async deleteNotification(id: string): Promise<void> {
      await fetchJson<void>(`/api/v1/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };

  // ── 11. SEARCH REPOSITORY ──────────────────────────────────────
  const search: SearchRepository = {
    async query({ q = "", category = "", limit = 30 }): Promise<SearchResult> {
      const params = new URLSearchParams({ q, category, limit: String(limit) });
      const res = await fetchJson<{
        products?: BackendProduct[];
        manufacturers?: BackendManufacturer[];
        reels?: BackendFeedItem[];
      }>(`/api/v1/search?${params}`, { cache: "no-store" });
      return {
        products: (res.products || []).map(normalizeProduct),
        manufacturers: (res.manufacturers || []).map(normalizeManufacturer),
        reels: (res.reels || []).map((item) => normalizeFeedItem(item)),
      };
    },
  };

  // ── 13. MEDIA REPOSITORY ───────────────────────────────────────
  const media: MediaRepository = {
    async upload(file: File, kind: UploadKind): Promise<UploadedMedia> {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetchJson<{ url?: string; contentType?: string; size?: number }>("/api/v1/media", {
        method: "POST",
        body,
      });
      if (!res?.url) throw new Error("Upload succeeded but no file URL was returned");
      return {
        url: resolveMediaUrl(res.url) || res.url,
        contentType: res.contentType || file.type,
        size: res.size ?? file.size,
      };
    },
  };

  // ── 14. PLATFORM REPOSITORY ────────────────────────────────────
  const platform: PlatformRepository = {
    async listBuyerPlans(): Promise<BuyerPlan[]> {
      const list = await fetchJson<BuyerPlan[]>("/api/v1/pricing/buyer-plans");
      return list.map((p) => ({ ...p, priceInr: Number(p.priceInr), priceCny: Number(p.priceCny) }));
    },

    async getExchangeRates(): Promise<ExchangeRates> {
      return fetchJson<ExchangeRates>("/api/v1/settings/exchange-rates");
    },
  };

  // ── 10. FACTORY REPOSITORY ────────────────────────────────────
  const factory: FactoryRepository = {
    async getProfile(): Promise<Manufacturer> {
      const data = await fetchJson<BackendManufacturer>("/api/v1/factory/profile", { cache: "no-store" });
      return normalizeManufacturer(data);
    },

    async updateProfile(data: Partial<Manufacturer>): Promise<Manufacturer> {
      const payload = {
        name: data.name,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        country: data.country,
        location: data.location,
        yearsEstablished: data.yearsEstablished,
        factorySize: data.factorySize,
        employees: data.employees,
        annualTurnover: data.annualTurnover,
        productionLines: data.productionLines,
        description: data.description,
        websiteUrl: data.websiteUrl,
        exportCountries: data.exportCountries,
        categoryIds: data.categoryIds,
        chairmanName: data.chairmanName,
        certifications: data.certifications,
        certificates: data.certificates?.map((cert) => ({ ...cert, imageUrl: toStoredMediaUrl(cert.imageUrl) })),
      };
      const res = await fetchJson<BackendManufacturer>("/api/v1/factory/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return normalizeManufacturer(res);
    },

    async getStats(): Promise<SellerStats | null> {
      try {
        const res = await fetchJson<BackendFactoryStats>("/api/v1/factory/stats", { cache: "no-store" });
        if (!res) return null;
        return normalizeFactoryStats(res);
      } catch {
        return null;
      }
    },

    async uploadMedia(file: File, kind: MediaKind): Promise<UploadedMedia> {
      // Assumed backend contract: multipart `file` + `kind` → { url, contentType, size }.
      // Backend should store to Aliyun OSS (video → VOD/HLS) and return a public or CDN URL.
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetchJson<{ url?: string; contentType?: string; content_type?: string; size?: number }>(
        "/api/v1/factory/media",
        { method: "POST", body },
      );
      if (!res?.url) throw new Error("Upload succeeded but no media URL was returned");
      return {
        url: res.url,
        contentType: res.contentType || res.content_type || file.type,
        size: res.size ?? file.size,
      };
    },

    async getProducts(): Promise<Product[]> {
      try {
        const list = await fetchJson<BackendProduct[]>("/api/v1/factory/products", { cache: "no-store" });
        return list.map(normalizeProduct);
      } catch (e) {
        console.error("Failed to fetch factory products:", e);
        return [];
      }
    },

    async addProduct(data: NewFactoryProduct): Promise<Product> {
      const res = await fetchJson<BackendProduct>("/api/v1/factory/products", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          imageUrl: toStoredMediaUrl(data.imageUrl),
          imageUrls: data.imageUrls?.map((url) => toStoredMediaUrl(url)),
          datasheetUrl: toStoredMediaUrl(data.datasheetUrl),
        }),
      });
      return normalizeProduct(res);
    },

    async updateProduct(id: string, data: FactoryProductUpdate): Promise<Product> {
      const res = await fetchJson<BackendProduct>(`/api/v1/factory/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          imageUrls: data.imageUrls?.map((url) => toStoredMediaUrl(url)),
          datasheetUrl: toStoredMediaUrl(data.datasheetUrl),
        }),
      });
      return normalizeProduct(res);
    },

    async setProductListed(id: string, listed: boolean): Promise<Product> {
      const res = await fetchJson<BackendProduct>(`/api/v1/factory/products/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ listed }),
      });
      return normalizeProduct(res);
    },

    async deleteProduct(id: string): Promise<void> {
      await fetchJson<void>(`/api/v1/factory/products/${id}`, {
        method: "DELETE",
      });
    },

    async getSeeks(): Promise<Reel[]> {
      try {
        const list = await fetchJson<BackendReel[]>("/api/v1/factory/seeks", { cache: "no-store" });
        return list.map((r) => normalizeReel(r));
      } catch {
        return [];
      }
    },

    async addSeek(data: NewFactorySeek): Promise<Reel> {
      const res = await fetchJson<BackendReel>("/api/v1/factory/seeks", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          posterUrl: toStoredMediaUrl(data.posterUrl),
          videoUrl: toStoredMediaUrl(data.videoUrl),
        }),
      });
      return { ...normalizeReel(res), categoryIds: data.categoryIds };
    },

    async updateSeek(id: string, data: FactorySeekUpdate): Promise<Reel> {
      const res = await fetchJson<BackendReel>(`/api/v1/factory/seeks/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          posterUrl: toStoredMediaUrl(data.posterUrl),
          videoUrl: toStoredMediaUrl(data.videoUrl),
        }),
      });
      return normalizeReel(res);
    },

    async setSeekListed(id: string, listed: boolean): Promise<Reel> {
      const res = await fetchJson<BackendReel>(`/api/v1/factory/seeks/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ listed }),
      });
      return normalizeReel(res);
    },

    async getVerification(): Promise<FactoryVerification> {
      const res = await fetchJson<Partial<FactoryVerification>>("/api/v1/factory/verification", { cache: "no-store" });
      return normalizeVerification(res);
    },

    async submitVerification(data: VerificationSubmission): Promise<FactoryVerification> {
      const res = await fetchJson<Partial<FactoryVerification>>("/api/v1/factory/verification", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return normalizeVerification(res);
    },

    async openRfqConversation(rfqId: string): Promise<Conversation> {
      const item = await fetchJson<BackendConversation>(
        `/api/v1/factory/rfqs/${encodeURIComponent(rfqId)}/conversation`,
        { method: "POST" },
      );
      return normalizeSellerConversation(item);
    },

    async deleteSeek(id: string): Promise<void> {
      await fetchJson<void>(`/api/v1/factory/seeks/${id}`, {
        method: "DELETE",
      });
    },

    async getRfqs(): Promise<RfqItem[]> {
      try {
        interface BackendRfqItem {
          id: string;
          referenceNumber?: string;
          reference_number?: string;
          productName?: string;
          product_name?: string;
          quantity?: string;
          unit?: string;
          targetPrice?: string;
          target_price?: string;
          currency?: string;
          incoterm?: string;
          details?: string;
          status?: string;
          createdAt?: string;
          created_at?: string;
          companyName?: string;
          company_name?: string;
          categoryId?: string;
          buyerName?: string;
          buyerCountry?: string;
          buyerAvatarUrl?: string;
          myQuotePrice?: number;
          myQuoteLeadTimeDays?: number;
          myQuoteIncoterm?: string;
          myQuoteNotes?: string;
          myQuotedAt?: string;
        }
        const list = await fetchJson<BackendRfqItem[]>("/api/v1/factory/rfqs", { cache: "no-store" });
        return list.map((item) => ({
          id: item.id,
          referenceNumber: item.referenceNumber || item.reference_number || `RFQ-${item.id.slice(0, 8)}`,
          productName: item.productName || item.product_name || "Untitled RFQ",
          quantity: item.quantity || "",
          unit: item.unit,
          targetPrice: item.targetPrice || item.target_price,
          currency: item.currency || "INR",
          incoterm: item.incoterm,
          details: item.details || "",
          status: item.status || "SUBMITTED",
          createdAt: item.createdAt || item.created_at || "",
          companyName: item.companyName || item.company_name,
          categoryId: item.categoryId,
          buyerName: item.buyerName,
          buyerCountry: item.buyerCountry,
          buyerAvatarUrl: resolveMediaUrl(item.buyerAvatarUrl),
          quotedPriceInr: item.myQuotePrice ?? undefined,
          leadTimeDays: item.myQuoteLeadTimeDays ?? undefined,
          quoteIncoterm: item.myQuoteIncoterm,
          quoteNotes: item.myQuoteNotes,
          quotedAt: item.myQuotedAt,
        }));
      } catch {
        return [];
      }
    },

    async submitQuote(rfqId: string, quote: FactoryQuote): Promise<void> {
      await fetchJson<void>(`/api/v1/factory/rfqs/${rfqId}/quote`, {
        method: "POST",
        body: JSON.stringify(quote),
      });
    },

    async getOrders(): Promise<OrderRequest[]> {
      const list = await fetchJson<BackendOrder[]>("/api/v1/factory/orders", { cache: "no-store" });
      return list.map(normalizeOrder);
    },

    async openOrderConversation(orderId: string): Promise<Conversation> {
      const item = await fetchJson<BackendConversation>(
        `/api/v1/factory/orders/${encodeURIComponent(orderId)}/conversation`,
        { method: "POST" },
      );
      return normalizeSellerConversation(item);
    },

    async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<OrderRequest> {
      const res = await fetchJson<BackendOrder>(`/api/v1/factory/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      return normalizeOrder(res);
    },
  };

  // ── 12. ACCOUNT (password, email verification) ─────────────
  const account: AccountRepository = {
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      await fetchJson<void>("/api/v1/account/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
    async sendEmailVerification(): Promise<void> {
      await fetchJson<void>("/api/v1/account/email/verification", { method: "POST" });
    },
    async requestPasswordReset(email: string): Promise<void> {
      await fetchJson<void>("/api/v1/auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    async resetPassword(token: string, newPassword: string): Promise<void> {
      await fetchJson<void>("/api/v1/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
    },
    async verifyEmail(token: string): Promise<void> {
      await fetchJson<void>("/api/v1/auth/email/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },
  };

  // ── 11. ORDER REQUESTS (buyer side) ───────────────────────────
  const orders: OrderRepository = {
    async place(input: NewOrderRequest): Promise<OrderRequest> {
      const res = await fetchJson<BackendOrder>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return normalizeOrder(res);
    },

    async listMine(): Promise<OrderRequest[]> {
      const list = await fetchJson<BackendOrder[]>("/api/v1/orders/mine", { cache: "no-store" });
      return list.map(normalizeOrder);
    },

    async cancel(orderId: string, reason?: string): Promise<OrderRequest> {
      return normalizeOrder(
        await fetchJson<BackendOrder>(`/api/v1/orders/${encodeURIComponent(orderId)}/cancel`, {
          method: "POST",
          body: JSON.stringify({ reason }),
        }),
      );
    },

    async getCart(): Promise<Cart> {
      return normalizeCart(await fetchJson<BackendCart>("/api/v1/cart", { cache: "no-store" }));
    },

    async addToCart(productId: string, quantity: number): Promise<Cart> {
      return normalizeCart(
        await fetchJson<BackendCart>("/api/v1/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId, quantity }),
        }),
      );
    },

    async updateCartQuantity(cartItemId: string, quantity: number): Promise<Cart> {
      return normalizeCart(
        await fetchJson<BackendCart>(`/api/v1/cart/items/${encodeURIComponent(cartItemId)}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        }),
      );
    },

    async removeFromCart(cartItemId: string): Promise<Cart> {
      return normalizeCart(
        await fetchJson<BackendCart>(`/api/v1/cart/items/${encodeURIComponent(cartItemId)}`, { method: "DELETE" }),
      );
    },

    async checkout(contact: OrderContact): Promise<OrderRequest[]> {
      const list = await fetchJson<BackendOrder[]>("/api/v1/cart/checkout", {
        method: "POST",
        body: JSON.stringify(contact),
      });
      return list.map(normalizeOrder);
    },
  };

  return {
    session,
    feed,
    manufacturers,
    products,
    categories,
    messages,
    notifications,
    rfq,
    comments,
    factory,
    search,
    orders,
    media,
    platform,
    account,
  };
}

// ── NORMALIZATION HELPERS (Convert Backend Snake_Case ➔ Frontend CamelCase) ──

/** Backend has returned the role as ROLE_SUPPLIER, SUPPLIER and Supplier across endpoints. */
function mapBackendRole(role: string | undefined): "Buyer" | "Supplier" {
  return role?.toUpperCase().replace(/^ROLE_/, "") === "SUPPLIER" ? "Supplier" : "Buyer";
}

const BACKEND_MEDIA_PREFIX = "/api/v1/media/";
const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");

/**
 * Backend uploads are stored as server-relative paths (/api/v1/media/<key>) so the DB
 * survives a backend host change. Prefix them with the API origin for <img>/<video>.
 * Other relative paths (e.g. /videos/*.mp4) are frontend assets and pass through.
 */
export function resolveMediaUrl(url: string | undefined): string | undefined {
  if (url && url.startsWith(BACKEND_MEDIA_PREFIX) && MEDIA_ORIGIN) return MEDIA_ORIGIN + url;
  return url;
}

/** Inverse of resolveMediaUrl: store backend media as relative paths. */
function toStoredMediaUrl(url: string): string;
function toStoredMediaUrl(url: string | undefined): string | undefined;
function toStoredMediaUrl(url: string | undefined) {
  if (url && MEDIA_ORIGIN && url.startsWith(MEDIA_ORIGIN + BACKEND_MEDIA_PREFIX)) {
    return url.slice(MEDIA_ORIGIN.length);
  }
  return url;
}

function normalizeReel(r: BackendReel, fallbackManufacturerId = "", tab: FeedTab = "for-you"): Reel {
  return {
    id: r.id,
    manufacturerId: r.manufacturerId || r.manufacturer_id || fallbackManufacturerId,
    title: r.title || r.caption || "",
    description: r.description || "",
    hashtags: r.hashtags || [],
    posterUrl: resolveMediaUrl(r.posterUrl || r.poster_url) || PLACEHOLDER_IMAGE,
    videoUrl: resolveMediaUrl(r.videoUrl || r.video_url),
    durationSec: r.durationSec ?? r.duration_sec ?? 0,
    startSec: r.startSec || r.start_sec || 0,
    views: r.views || 0,
    likes: r.likes || r.likesCount || r.likes_count || 0,
    comments: r.comments || r.commentsCount || r.comments_count || 0,
    shares: r.shares || 0,
    saves: r.saves || r.savesCount || r.saves_count || 0,
    tab,
    productIds: r.productIds || r.product_ids || [],
    listed: r.listed ?? true,
    likedByMe: r.likedByMe,
    savedByMe: r.savedByMe,
  };
}

function normalizeFeedItem(item: BackendFeedItem, tab: FeedTab = "for-you"): FeedItem {
  return {
    reel: normalizeReel(item.reel, item.manufacturer?.id, tab),
    manufacturer: normalizeManufacturer(item.manufacturer || {}),
    primaryProductSlug: item.primaryProductSlug || item.primary_product_slug,
    products: (item.products || []).map(normalizeProduct),
    followingManufacturer: item.followingManufacturer,
  };
}

/** Values the backend does not send stay empty; the UI shows its empty state rather than invented data. */
function normalizeManufacturer(m: BackendManufacturer): Manufacturer {
  return {
    id: m.id || "",
    slug: m.slug || "",
    name: m.name || "",
    logoUrl: resolveMediaUrl(m.logoUrl || m.logo_url) || PLACEHOLDER_IMAGE,
    coverUrl: resolveMediaUrl(m.coverUrl || m.cover_url) || PLACEHOLDER_IMAGE,
    country: m.country || "",
    location: m.location || "",
    verified: m.verified ?? false,
    premium: m.premium ?? false,
    yearsEstablished: m.yearsEstablished ?? m.years_established ?? 0,
    factorySize: m.factorySize || m.factory_size || "",
    employees: m.employees || "",
    exportCountries: m.exportCountries || m.export_countries || [],
    description: m.description || "",
    followerCount: m.followerCount ?? m.follower_count ?? 0,
    categoryIds: m.categoryIds || m.category_ids || [],
    chairmanName: m.chairmanName || m.chairman_name,
    websiteUrl: m.websiteUrl || m.website_url,
    annualTurnover: m.annualTurnover || m.annual_turnover,
    productionLines: m.productionLines ?? m.production_lines,
    certificates: m.certificates?.map((cert) => ({
      ...cert,
      certNumber: cert.certNumber ?? "",
      imageUrl: resolveMediaUrl(cert.imageUrl) || "",
    })),
    certifications: m.certifications ?? [],
  };
}

function normalizeVerification(v: Partial<FactoryVerification> | null | undefined): FactoryVerification {
  return {
    status: v?.status ?? "PENDING",
    submitted: Boolean(v?.submitted),
    submittedAt: v?.submittedAt ?? undefined,
    reviewedAt: v?.reviewedAt ?? undefined,
    rejectionReason: v?.rejectionReason ?? undefined,
    companyRegNumber: v?.companyRegNumber ?? undefined,
    taxId: v?.taxId ?? undefined,
    registrationDate: v?.registrationDate ?? undefined,
    factoryAddress: v?.factoryAddress ?? undefined,
    certifications: v?.certifications ?? [],
  };
}

/** A conversation opened from the seller hub (seller view: buyer fields filled). */
function normalizeSellerConversation(item: BackendConversation): Conversation {
  return {
    id: item.id,
    manufacturerId: item.manufacturerId || item.manufacturer?.id || "",
    buyerId: item.buyerId || item.buyer_id,
    buyerName: item.buyerName || item.buyer_name,
    buyerCompany: item.buyerCompany || item.buyer_company,
    buyerAvatarUrl: resolveMediaUrl(item.buyerAvatarUrl || item.buyer_avatar_url),
    lastMessage: typeof item.lastMessage === "string" ? item.lastMessage : "",
    lastMessageAt: item.lastMessageAt || item.last_message_at || "",
    unreadCount: item.unreadCount ?? item.unread_count ?? 0,
  };
}

function normalizeProduct(p: BackendProduct): Product {
  let moqStr = "";
  if (typeof p.moq === "number") {
    moqStr = `${p.moq} ${p.unit || ""}`.trim();
  } else if (typeof p.moq === "string") {
    moqStr = p.moq;
  }

  return {
    id: p.id || "",
    slug: p.slug || "",
    manufacturerId: p.manufacturerId || p.manufacturer_id || p.manufacturer?.id || "",
    name: p.name || "",
    imageUrl:
      resolveMediaUrl(p.imageUrl || p.primaryImageUrl || p.primary_image_url || p.image_url) || PLACEHOLDER_IMAGE,
    description: p.description || "",
    priceInr: Number(p.priceInr ?? p.price_inr ?? 0),
    unit: p.unit || "",
    moq: moqStr,
    categoryId: p.categoryId || p.category_id || "",
    specs: p.specs || {},
    imageUrls: p.imageUrls?.length
      ? p.imageUrls.map((url) => resolveMediaUrl(url) || url)
      : undefined,
    datasheetUrl: resolveMediaUrl(p.datasheetUrl),
    datasheetName: p.datasheetName,
    listed: p.listed ?? true,
    priceTiers: (p.priceTiers || []).map((t) => ({ minQty: Number(t.minQty), priceInr: Number(t.priceInr) })),
    savedByMe: p.savedByMe,
  };
}

function normalizeCategory(c: BackendCategory): Category {
  return {
    id: c.id || "",
    slug: c.slug || "",
    name: c.name || "",
    listingCount: c.listing_count || c.listingCount || 0,
    icon: (c.icon || "other") as CategoryIconKey,
    parentId: c.parent_id || c.parentId || null,
  };
}

function toProfile(user: BackendUser): BuyerProfile {
  return {
    id: user.id,
    name: user.name || "",
    role: mapBackendRole(user.role),
    avatarUrl: resolveMediaUrl(user.avatarUrl || user.avatar_url) || "",
    companyName: user.companyName || user.company_name || "",
    industry: user.industry || "",
    country: user.country || "",
    email: user.email,
    phone: user.phone,
    taxId: user.taxId,
    address: user.address,
    plan: normalizePlan(user.plan),
    memberSince: user.memberSince,
  };
}

/** Fallback when /auth/me cannot be read right after sign-in: only what the auth response carried. */
function authResponseToProfile(res: BackendAuthResponse): BuyerProfile {
  return {
    id: res.user?.id || res.userId || res.user_id || "",
    name: res.user?.name || res.name || "",
    role: mapBackendRole(res.user?.role || res.role),
    avatarUrl: resolveMediaUrl(res.avatarUrl || res.avatar_url) || "",
    companyName: res.companyName || res.company_name || "",
    industry: "",
    country: "",
    email: res.email,
  };
}

function normalizePlan(plan: string | undefined): BuyerPlanTier {
  const value = plan?.toLowerCase();
  return value === "pro" || value === "enterprise" ? value : "free";
}

function normalizeReply(r: BackendCommentReply): ReelCommentReply {
  return {
    id: r.id,
    authorName: r.authorName || "",
    authorAvatarUrl: resolveMediaUrl(r.authorAvatarUrl) || "",
    authorCompany: r.authorCompany,
    authorCountry: r.authorCountry,
    isVerified: r.verified ?? r.isVerified,
    content: r.content,
    createdAt: r.createdAt || "",
    likes: r.likes ?? 0,
    likedByMe: r.likedByMe,
  };
}

function normalizeComment(c: BackendComment, reelId: string): ReelComment {
  return {
    ...normalizeReply(c),
    reelId: c.reelId || reelId,
    replies: (c.replies || []).map(normalizeReply),
  };
}

const NOTIFICATION_TYPES: NotificationType[] = ["system", "quote", "rfq", "message", "follow", "order"];

function normalizeNotification(n: BackendNotification): AppNotification {
  const type = (n.type || "system").toLowerCase() as NotificationType;
  return {
    id: n.id,
    title: n.title || "",
    body: n.body || "",
    createdAt: n.createdAt || "",
    read: n.read ?? false,
    type: NOTIFICATION_TYPES.includes(type) ? type : "system",
    referenceId: n.referenceId,
  };
}

function normalizeRfq(item: BackendRfq): RfqItem {
  return {
    id: item.id,
    referenceNumber: item.referenceNumber || "",
    productName: item.productName || "",
    categoryId: item.categoryId,
    quantity: item.quantity || "",
    unit: item.unit,
    targetPrice: item.targetPrice,
    currency: item.currency,
    incoterm: item.incoterm,
    details: item.details,
    companyName: item.companyName,
    attachmentName: item.attachmentName,
    attachmentUrl: resolveMediaUrl(item.attachmentUrl),
    status: item.status || "",
    createdAt: item.createdAt || "",
    quoteCount: item.quoteCount,
    quotes: item.quotes?.map(
      (q): RfqQuote => ({
        id: q.id,
        manufacturer: normalizeManufacturer(q.manufacturer || {}),
        quotePrice: Number(q.quotePrice ?? 0),
        currency: q.currency || "INR",
        leadTimeDays: q.leadTimeDays ?? 0,
        notes: q.notes,
        attachmentUrl: resolveMediaUrl(q.attachmentUrl),
        status: q.status || "PENDING",
        createdAt: q.createdAt || "",
        orderId: q.orderId,
      }),
    ),
  };
}

function normalizeCart(c: BackendCart): Cart {
  return {
    items: (c.items || []).map(
      (i): CartItem => ({
        id: i.id,
        product: normalizeProduct(i.product),
        manufacturer: normalizeManufacturer(i.manufacturer),
        quantity: i.quantity,
        minQuantity: i.minQuantity ?? 1,
        unitPrice: i.unitPrice == null ? undefined : Number(i.unitPrice),
        lineTotal: i.lineTotal == null ? undefined : Number(i.lineTotal),
      }),
    ),
    itemCount: c.itemCount ?? c.items?.length ?? 0,
    totalAmount: Number(c.totalAmount ?? 0),
    currency: c.currency || "INR",
  };
}

// Backend omits null KPIs ("not enough data"); keep them null rather than inventing values.
function normalizeFactoryStats(res: BackendFactoryStats): SellerStats {
  return {
    periodDays: res.periodDays,
    totalProductViews: res.totalProductViews ?? res.total_product_views ?? 0,
    productViewsChange: res.productViewsChange ?? res.product_views_change ?? null,
    factoryProfileVisits: res.factoryProfileVisits ?? res.factory_profile_visits ?? 0,
    profileVisitsChange: res.profileVisitsChange ?? res.profile_visits_change ?? null,
    videoSeekPlays: res.videoSeekPlays ?? res.video_seek_plays ?? 0,
    videoPlaysChange: res.videoPlaysChange ?? res.video_plays_change ?? null,
    activeRfqsCount: res.activeRfqsCount ?? res.active_rfqs_count ?? 0,
    pendingRfqsCount: res.pendingRfqsCount ?? res.pending_rfqs_count ?? 0,
    responseRatePercent: res.responseRatePercent ?? res.response_rate_percent ?? null,
    avgResponseTimeHours: res.avgResponseTimeHours ?? res.avg_response_time_hours ?? null,
    responseWindowDays: res.responseWindowDays,
    followerCount: res.followerCount ?? res.follower_count ?? 0,
    totalProductsCount: res.totalProductsCount ?? res.total_products_count ?? 0,
    totalSeeksCount: res.totalSeeksCount ?? res.total_seeks_count ?? 0,
    weeklyTrend: (res.weeklyTrend ?? []).map((point) => ({
      weekStart: point.weekStart,
      seekViews: point.seekViews ?? 0,
      productViews: point.productViews ?? 0,
      rfqs: point.rfqs ?? 0,
    })),
  };
}

interface BackendOrderParty {
  id?: string;
  name?: string;
  slug?: string;
  companyName?: string;
  country?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

interface BackendOrder {
  id: string;
  referenceNumber?: string;
  status?: string;
  statusUpdatedAt?: string;
  createdAt?: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  productImageUrl?: string;
  unitPriceInr?: number;
  unit?: string;
  quantity?: number;
  estimatedTotalInr?: number;
  buyerNote?: string;
  sellerNote?: string;
  manufacturer?: BackendOrderParty;
  buyer?: BackendOrderParty;
  source?: string;
  rfqId?: string;
  currency?: string;
  quotedTotal?: number;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
  cancelReason?: string;
  cancellable?: boolean;
}

function normalizeOrderParty(p: BackendOrderParty | undefined): OrderParty {
  return {
    id: p?.id || "",
    name: p?.name || "",
    slug: p?.slug,
    companyName: p?.companyName,
    country: p?.country,
    avatarUrl: resolveMediaUrl(p?.avatarUrl),
    email: p?.email,
    phone: p?.phone,
  };
}

function normalizeOrder(o: BackendOrder): OrderRequest {
  return {
    id: o.id,
    referenceNumber: o.referenceNumber || "",
    status: (o.status || "PENDING") as OrderStatus,
    statusUpdatedAt: o.statusUpdatedAt,
    createdAt: o.createdAt || "",
    productId: o.productId,
    productSlug: o.productSlug,
    productName: o.productName || "",
    productImageUrl: resolveMediaUrl(o.productImageUrl),
    unitPriceInr: o.unitPriceInr,
    unit: o.unit,
    quantity: o.quantity ?? 0,
    estimatedTotalInr: o.estimatedTotalInr,
    buyerNote: o.buyerNote,
    sellerNote: o.sellerNote,
    manufacturer: normalizeOrderParty(o.manufacturer),
    buyer: normalizeOrderParty(o.buyer),
    source: (o.source || "DIRECT") as OrderRequest["source"],
    rfqId: o.rfqId,
    currency: o.currency || "INR",
    quotedTotal: o.quotedTotal == null ? undefined : Number(o.quotedTotal),
    contactName: o.contactName,
    contactPhone: o.contactPhone,
    deliveryAddress: o.deliveryAddress,
    cancelReason: o.cancelReason,
    cancellable: o.cancellable ?? false,
  };
}

function normalizeMessage(m: BackendMessage, conversationId: string): MessageItem {
  const rawType = (m.senderType || m.sender_type || "USER").toUpperCase();
  const sender: "user" | "factory" = rawType.includes("FACTORY") || rawType.includes("SUPPLIER") ? "factory" : "user";
  const attachmentUrl = m.attachmentUrl || m.attachment_url;
  const attachmentName = m.attachmentName || m.attachment_name;
  return {
    id: m.id,
    conversationId: m.conversationId || m.conversation_id || conversationId,
    sender,
    text: m.messageText || m.message_text || "",
    time: m.createdAt || m.created_at || "",
    attachment:
      attachmentName || attachmentUrl
        ? {
            name: attachmentName || "attachment",
            size: m.attachmentSize || m.attachment_size || "",
            url: attachmentUrl,
            contentType: m.attachmentContentType,
          }
        : undefined,
    order: m.order
      ? {
          id: m.order.id,
          referenceNumber: m.order.referenceNumber || "",
          productName: m.order.productName || "",
          productSlug: m.order.productSlug,
          quantity: m.order.quantity,
          unit: m.order.unit,
          status: m.order.status,
        }
      : undefined,
    isRead: m.isRead ?? m.is_read ?? false,
  };
}
