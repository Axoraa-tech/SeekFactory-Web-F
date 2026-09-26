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
  UploadedMedia,
} from "@/shared/api/contracts";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import type { Category, CategoryIconKey } from "@/entities/category";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import type { FeedTab, Reel } from "@/entities/reel";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { AppNotification } from "@/entities/notification";
import type { Conversation } from "@/entities/message";
import type { RfqDraft, RfqItem } from "@/entities/rfq";
import type { BuyerProfile } from "@/entities/user";
import type { SellerStats } from "@/features/factory/types";
import {
  clearBrowserCookie,
  parseSessionCookie,
  payloadToProfile,
  readBrowserCookie,
  SESSION_COOKIE,
  writeBrowserCookie,
  type JoinInput,
  type LoginInput,
  type SessionPayload,
} from "@/features/auth/session-cookie";

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
}

interface BackendAuthResponse {
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
  user_name?: string;
  author_name?: string;
  author_avatar_url?: string;
  content: string;
  created_at?: string;
  likes_count?: number;
}

interface BackendComment {
  id: string;
  reel_id?: string;
  user_name?: string;
  author_name?: string;
  author_avatar_url?: string;
  author_company?: string;
  content: string;
  created_at?: string;
  likes_count?: number;
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
  user_id?: string;
  type?: string;
  title?: string;
  body?: string;
  link?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
}

interface BackendFactoryStats {
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
        throw new Error(errorMsg);
      }

      const json = (await res.json()) as BackendResponse<T>;
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
  const session: SessionRepository = {
    async getCurrentUser(): Promise<BuyerProfile | null> {
      try {
        const user = await fetchJson<BackendUser>("/api/v1/auth/me");
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          role: mapBackendRole(user.role),
          avatarUrl: user.avatar_url || user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
          companyName: user.company_name || user.companyName || "Enterprise Member",
          industry: user.industry || "Manufacturing",
          country: user.country || "India",
          email: user.email,
          phone: user.phone,
        };
      } catch {
        // Return null if backend auth fails
        return null;
      }
    },

    async join(input: JoinInput): Promise<BuyerProfile> {
      const payload = {
        name: input.name || input.email?.split("@")[0] || "New Member",
        email: input.email,
        password: input.password || "Password@123",
        role: input.role === "Supplier" ? "SUPPLIER" : "BUYER",
        companyName: input.companyName || "New Company",
        industry: input.industry || "Manufacturing",
        country: input.country || "India",
        phone: input.phone,
      };

      const res = await fetchJson<BackendAuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const userId = res.user?.id || res.user_id || res.userId || `user-${Date.now()}`;
      const userName = res.user?.name || res.name || payload.name;
      const userEmail = res.user?.email || res.email || payload.email || "";
      const roleRaw = res.user?.role || res.role || input.role;
      const userRole: "Buyer" | "Supplier" =
        mapBackendRole(roleRaw);
      const userCompany =
        res.user?.company_name || res.company_name || res.companyName || payload.companyName;

      const sessionData: SessionPayload = {
        id: userId,
        name: userName,
        role: userRole,
        email: userEmail,
        companyName: userCompany,
      };

      writeBrowserCookie(sessionData);
      return payloadToProfile(sessionData);
    },

    async login(input: LoginInput): Promise<BuyerProfile> {
      let res: BackendAuthResponse;

      if (input.method === "phone" && input.phone) {
        res = await fetchJson<BackendAuthResponse>("/api/v1/auth/login/phone", {
          method: "POST",
          body: JSON.stringify({ phone: input.phone, otp: "123456", role: input.role }),
        });
      } else {
        res = await fetchJson<BackendAuthResponse>("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: input.email, password: input.password }),
        });
      }

      const userId = res.user?.id || res.userId || res.user_id || `user-${Date.now()}`;
      const userName = res.user?.name || res.name || "Member";
      const userEmail = res.user?.email || res.email || input.email || "";
      const roleRaw = res.user?.role || res.role || input.role;
      const userRole: "Buyer" | "Supplier" =
        mapBackendRole(roleRaw);
      const userCompany =
        res.user?.companyName || res.user?.company_name || res.companyName || res.company_name || "Enterprise Member";

      const sessionData: SessionPayload = {
        id: userId,
        name: userName,
        role: userRole,
        email: userEmail,
        companyName: userCompany,
      };

      writeBrowserCookie(sessionData);
      return payloadToProfile(sessionData);
    },

    async logout(): Promise<void> {
      try {
        await fetchJson<void>("/api/v1/auth/logout", { method: "POST" });
      } catch {
        // Ignore errors on logout
      } finally {
        clearBrowserCookie();
      }
    },

    async updateProfile(input: {
      name?: string;
      companyName?: string;
      industry?: string;
      country?: string;
      phone?: string;
    }): Promise<BuyerProfile> {
      const updated = await fetchJson<BackendUser>("/api/v1/users/me", {
        method: "PUT",
        body: JSON.stringify(input),
      });

      if (typeof window !== "undefined") {
        const session = readBrowserCookie();
        if (session) {
          writeBrowserCookie({
            ...session,
            name: updated.name || session.name,
            companyName: updated.companyName || updated.company_name || input.companyName || session.companyName,
          });
        }
      }

      return {
        id: updated.id || "user-me",
        name: updated.name || input.name || "Member",
        role: "Buyer",
        avatarUrl: updated.avatarUrl || updated.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        companyName: updated.companyName || updated.company_name || input.companyName || "Enterprise Member",
        industry: updated.industry || input.industry || "Manufacturing",
        country: updated.country || input.country || "India",
        email: updated.email,
        phone: updated.phone || input.phone,
      };
    },
  };

  // ── 2. FEED REPOSITORY ─────────────────────────────────────────
  const feed: FeedRepository = {
    async list(tab: FeedTab) {
      const data = await fetchJson<BackendFeedItem[]>(`/api/v1/feed?tab=${tab}`, { cache: "no-store" });
      return data.map((item) => {
        const reel = normalizeReel(item.reel, item.manufacturer?.id, tab);
        return {
          reel: {
            ...reel,
            posterUrl: reel.posterUrl || "https://images.seekfactory.com/posters/default.jpg",
          },
          manufacturer: normalizeManufacturer(item.manufacturer || {}),
          primaryProductSlug: item.primaryProductSlug || item.primary_product_slug,
          products: (item.products || []).map(normalizeProduct),
        };
      });
    },

    async addReel(reel: Reel): Promise<void> {
      try {
        await fetchJson<void>("/api/v1/feed", {
          method: "POST",
          body: JSON.stringify(reel),
        });
      } catch {
        // Safe fallback
      }
    },

    async likeReel(reelId: string): Promise<{ liked: boolean; likesCount: number }> {
      try {
        const res = await fetchJson<{ liked: boolean; likesCount: number }>(`/api/v1/feed/${reelId}/like`, {
          method: "POST",
        });
        return res;
      } catch {
        return { liked: true, likesCount: 1 };
      }
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

    async saveReel(reelId: string): Promise<{ saved: boolean; savesCount: number }> {
      try {
        const res = await fetchJson<{ saved: boolean; savesCount: number }>(`/api/v1/feed/${reelId}/save`, {
          method: "POST",
        });
        return res;
      } catch {
        return { saved: true, savesCount: 1 };
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
        // Backend returns { manufacturer, products, reels }; older builds returned a flat manufacturer.
        const detail = await fetchJson<
          BackendManufacturer & { manufacturer?: BackendManufacturer }
        >(`/api/v1/manufacturers/${slug}`);
        const manufacturer = detail.manufacturer ?? detail;
        return {
          manufacturer: normalizeManufacturer(manufacturer),
          products: (detail.products || []).map(normalizeProduct),
          reels: (detail.reels || []).map((r) => normalizeReel(r, manufacturer.id)),
        };
      } catch {
        return null;
      }
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
        // Backend returns { product, manufacturer, related }; older builds returned a flat product.
        const detail = await fetchJson<
          BackendProduct & { product?: BackendProduct; related?: BackendProduct[] }
        >(`/api/v1/products/${slug}`);
        const product = detail.product ?? detail;
        return {
          product: normalizeProduct(product),
          manufacturer: normalizeManufacturer(detail.manufacturer || product.manufacturer || {}),
        };
      } catch {
        return null;
      }
    },

    async listByCategory(categoryId: string): Promise<Product[]> {
      const list = await fetchJson<BackendProduct[]>(`/api/v1/products/category/${categoryId}`);
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

    async addProduct(product: Product): Promise<void> {
      try {
        await fetchJson<void>("/api/v1/products", {
          method: "POST",
          body: JSON.stringify(product),
        });
      } catch {
        // Safe fallback
      }
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
      const payload = {
        productName: draft.productName,
        categoryId: draft.categoryId,
        quantity: draft.quantity,
        unit: draft.unit || "Pieces",
        targetPrice: draft.targetPrice || "Negotiable",
        currency: draft.currency || "INR",
        incoterm: draft.incoterm || "FOB",
        companyName: draft.companyName || "Global Buyer",
        details: draft.details,
        attachmentName: draft.attachmentName,
        attachmentSize: draft.attachmentSize,
        attachmentUrl: draft.attachmentUrl,
      };

      const result = await fetchJson<{ ok: boolean; id: string; referenceNumber?: string }>(
        "/api/v1/rfqs",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      return { ok: true, id: result.id, referenceNumber: result.referenceNumber };
    },

    async listMyRfqs(): Promise<RfqItem[]> {
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
        }

        const list = await fetchJson<BackendRfqItem[]>("/api/v1/rfqs");
        return list.map((item) => ({
          id: item.id,
          referenceNumber: item.referenceNumber || item.reference_number || `RFQ-${item.id.slice(0, 8)}`,
          productName: item.productName || item.product_name || "Industrial Component",
          quantity: item.quantity || "100",
          unit: item.unit || "Pieces",
          targetPrice: item.targetPrice || item.target_price || "Negotiable",
          currency: item.currency || "INR",
          incoterm: item.incoterm || "FOB",
          details: item.details || "",
          status: item.status || "SUBMITTED",
          createdAt: item.createdAt || item.created_at || "Just now",
        }));
      } catch {
        return [];
      }
    },
  };

  // ── 7. COMMENT REPOSITORY ──────────────────────────────────────
  const comments: CommentRepository = {
    async listByReelId(reelId: string): Promise<ReelComment[]> {
      const list = await fetchJson<BackendComment[]>(`/api/v1/reels/${reelId}/comments`);
      return list.map((c) => ({
        id: c.id,
        reelId: c.reel_id || reelId,
        authorName: c.user_name || c.author_name || "Member",
        authorAvatarUrl: c.author_avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        authorCompany: c.author_company,
        content: c.content,
        createdAt: c.created_at || "Just now",
        likes: c.likes_count || 0,
        replies: (c.replies || []).map((r: BackendCommentReply) => ({
          id: r.id,
          authorName: r.user_name || r.author_name || "Member",
          authorAvatarUrl: r.author_avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
          content: r.content,
          createdAt: r.created_at || "Just now",
          likes: r.likes_count || 0,
        })),
      }));
    },

    async addComment(reelId: string, content: string): Promise<ReelComment> {
      const res = await fetchJson<BackendComment>(`/api/v1/reels/${reelId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      return {
        id: res.id,
        reelId: reelId,
        authorName: res.user_name || "You",
        authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        content: res.content,
        createdAt: res.created_at || "Just now",
        likes: 0,
        replies: [],
      };
    },

    async addReply(commentId: string, content: string): Promise<ReelCommentReply> {
      const res = await fetchJson<BackendCommentReply>(`/api/v1/comments/${commentId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      return {
        id: res.id,
        authorName: res.user_name || "You",
        authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        content: res.content,
        createdAt: res.created_at || "Just now",
        likes: 0,
      };
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
            new Date().toISOString();

          return {
            id: item.id,
            manufacturerId: item.manufacturerId || item.manufacturer?.id || "mfg-01",
            buyerId: item.buyerId || "b-0",
            buyerName: item.buyerName || "Buyer",
            buyerCompany: item.buyerCompany || item.manufacturer?.name || "Global Buyer",
            buyerAvatarUrl: item.buyerAvatarUrl || item.manufacturer?.logoUrl || "https://images.seekfactory.com/logos/default.png",
            lastMessage: lastMsg,
            lastMessageAt: lastAt,
            unreadCount: item.unreadCount ?? item.unread_count ?? 0,
            manufacturer: normalizeManufacturer(item.manufacturer || {}),
          };
        });
      } catch {
        // Return empty list if unauthenticated (e.g. static prerendering or guest)
        return [];
      }
    },

    async getMessages(conversationId: string) {
      try {
        const list = await fetchJson<BackendMessage[]>(`/api/v1/conversations/${conversationId}/messages`);
        return list.map((m) => {
          const rawType = (m.senderType || m.sender_type || "USER").toUpperCase();
          const sender: "user" | "factory" = rawType.includes("FACTORY") || rawType.includes("SUPPLIER") ? "factory" : "user";
          return {
            id: m.id,
            conversationId: m.conversationId || m.conversation_id || conversationId,
            sender,
            text: m.messageText || m.message_text || "",
            time: m.createdAt || m.created_at || "Just now",
            attachment: (m.attachmentName || m.attachment_name) ? {
              name: m.attachmentName || m.attachment_name || "attachment",
              size: m.attachmentSize || m.attachment_size || "",
              url: m.attachmentUrl || m.attachment_url,
            } : undefined,
            isRead: m.isRead ?? m.is_read ?? false,
          };
        });
      } catch {
        return [];
      }
    },

    async sendMessage(
      conversationId: string,
      text: string,
      attachment?: MessageAttachment
    ) {
      const payload = {
        messageText: text,
        attachmentName: attachment?.name,
        attachmentSize: attachment?.size,
        attachmentUrl: attachment?.url,
      };

      const m = await fetchJson<BackendMessage>(`/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const rawType = (m.senderType || m.sender_type || "USER").toUpperCase();
      const sender: "user" | "factory" = rawType.includes("FACTORY") || rawType.includes("SUPPLIER") ? "factory" : "user";

      return {
        id: m.id,
        conversationId: m.conversationId || m.conversation_id || conversationId,
        sender,
        text: m.messageText || m.message_text || text,
        time: m.createdAt || m.created_at || "Just now",
        attachment: (m.attachmentName || m.attachment_name) ? {
          name: m.attachmentName || m.attachment_name || "",
          size: m.attachmentSize || m.attachment_size || "",
          url: m.attachmentUrl || m.attachment_url,
        } : undefined,
        isRead: m.isRead ?? m.is_read ?? false,
      };
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
        lastMessageAt: item.lastMessageAt || item.last_message_at || new Date().toISOString(),
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
      
      const evtSource = new EventSource(`/api/v1/conversations/${conversationId}/stream`);
      
      evtSource.addEventListener("message", (event) => {
        try {
          const m: BackendMessage = JSON.parse(event.data);
          const rawType = (m.senderType || m.sender_type || "USER").toUpperCase();
          const sender: "user" | "factory" = rawType.includes("FACTORY") || rawType.includes("SUPPLIER") ? "factory" : "user";
          
          callback({
            id: m.id,
            conversationId: m.conversationId || m.conversation_id || conversationId,
            sender,
            text: m.messageText || m.message_text || "",
            time: m.createdAt || m.created_at || "Just now",
            attachment: (m.attachmentName || m.attachment_name) ? {
              name: m.attachmentName || m.attachment_name || "attachment",
              size: m.attachmentSize || m.attachment_size || "",
              url: m.attachmentUrl || m.attachment_url,
            } : undefined,
            isRead: m.isRead ?? m.is_read ?? false,
          });
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
        const list = await fetchJson<BackendNotification[]>("/api/v1/notifications");
        return list.map((n) => ({
          id: n.id,
          title: n.title || "",
          body: n.body || "",
          createdAt: n.created_at || new Date().toISOString(),
          read: n.is_read ?? n.read ?? false,
        }));
      } catch {
        // Return empty list if unauthenticated (e.g. static prerendering or guest)
        return [];
      }
    },

    async unreadCount(): Promise<number> {
      try {
        const res = await fetchJson<{ count: number }>("/api/v1/notifications/unread-count");
        return res.count || 0;
      } catch {
        return 0;
      }
    },

    async markAllAsRead(): Promise<void> {
      try {
        await fetchJson<void>("/api/v1/notifications/mark-read", {
          method: "PUT",
        });
      } catch {
        // Safe fallback
      }
    },

    async markAsRead(id: string): Promise<void> {
      try {
        await fetchJson<void>(`/api/v1/notifications/${id}/read`, {
          method: "PUT",
        });
      } catch {
        // Safe fallback
      }
    },

    async deleteNotification(id: string): Promise<void> {
      try {
        await fetchJson<void>(`/api/v1/notifications/${id}`, {
          method: "DELETE",
        });
      } catch {
        // Safe fallback
      }
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
        certificates: data.certificates,
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
        body: JSON.stringify({ ...data, imageUrl: toStoredMediaUrl(data.imageUrl) }),
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
          buyerName?: string;
          buyer_name?: string;
          buyerCountry?: string;
          buyer_country?: string;
          quotePrice?: number;
          quote_price?: number;
          leadTimeDays?: number;
          lead_time_days?: number;
        }
        const list = await fetchJson<BackendRfqItem[]>("/api/v1/factory/rfqs", { cache: "no-store" });
        return list.map((item) => ({
          id: item.id,
          referenceNumber: item.referenceNumber || item.reference_number || `RFQ-${item.id.slice(0, 8)}`,
          productName: item.productName || item.product_name || "Industrial Component",
          quantity: item.quantity || "100",
          unit: item.unit || "Pieces",
          targetPrice: item.targetPrice || item.target_price || "Negotiable",
          currency: item.currency || "INR",
          incoterm: item.incoterm || "FOB",
          details: item.details || "",
          status: item.status || "SUBMITTED",
          createdAt: item.createdAt || item.created_at || "Just now",
          companyName: item.companyName || item.company_name,
          buyerName: item.buyerName || item.buyer_name,
          buyerCountry: item.buyerCountry || item.buyer_country,
          quotedPriceInr: item.quotePrice ?? item.quote_price,
          leadTimeDays: item.leadTimeDays ?? item.lead_time_days,
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
    title: r.title || r.caption || "Factory Seek",
    description: r.description || "",
    hashtags: r.hashtags || [],
    posterUrl: resolveMediaUrl(r.posterUrl || r.poster_url) || "",
    videoUrl: resolveMediaUrl(r.videoUrl || r.video_url),
    durationSec: r.durationSec || r.duration_sec || 30,
    startSec: r.startSec || r.start_sec || 0,
    views: r.views || 0,
    likes: r.likes || r.likesCount || r.likes_count || 0,
    comments: r.comments || r.commentsCount || r.comments_count || 0,
    shares: r.shares || 0,
    saves: r.saves || r.savesCount || r.saves_count || 0,
    tab,
    productIds: r.productIds || r.product_ids || [],
  };
}

function normalizeManufacturer(m: BackendManufacturer): Manufacturer {
  return {
    id: m.id || "",
    slug: m.slug || "",
    name: m.name || "Verified Factory",
    logoUrl: resolveMediaUrl(m.logoUrl || m.logo_url) || "https://images.seekfactory.com/logos/default.png",
    coverUrl: resolveMediaUrl(m.coverUrl || m.cover_url) || "https://images.seekfactory.com/covers/default.jpg",
    country: m.country || "China",
    location: m.location || "Zhejiang, China",
    verified: m.verified ?? true,
    premium: m.premium ?? false,
    yearsEstablished: m.yearsEstablished ?? m.years_established ?? 12,
    factorySize: m.factorySize || m.factory_size || "20,000 sq.m",
    employees: m.employees || "200-500",
    exportCountries: m.exportCountries || m.export_countries || ["India", "USA", "Germany"],
    description: m.description || "",
    followerCount: m.followerCount ?? m.follower_count ?? 1200,
    categoryIds: m.categoryIds || m.category_ids || [],
    chairmanName: m.chairmanName || m.chairman_name,
    websiteUrl: m.websiteUrl || m.website_url,
    annualTurnover: m.annualTurnover || m.annual_turnover,
    productionLines: m.productionLines ?? m.production_lines,
    certificates: m.certificates,
  };
}

function normalizeProduct(p: BackendProduct): Product {
  let moqStr = "1 unit";
  if (typeof p.moq === "number") {
    moqStr = `${p.moq} units`;
  } else if (typeof p.moq === "string") {
    moqStr = p.moq;
  }

  return {
    id: p.id || "",
    slug: p.slug || "",
    manufacturerId: p.manufacturerId || p.manufacturer_id || p.manufacturer?.id || "",
    name: p.name || "",
    imageUrl:
      resolveMediaUrl(p.imageUrl || p.primaryImageUrl || p.primary_image_url || p.image_url) ||
      "https://images.seekfactory.com/products/default.jpg",
    description: p.description || "",
    priceInr: p.priceInr ?? p.price_inr ?? 150000,
    unit: p.unit || "SET",
    moq: moqStr,
    categoryId: p.categoryId || p.category_id || "",
    specs: p.specs || {},
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
  };
}
