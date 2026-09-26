import type {
  ApiClient,
  CategoryRepository,
  CommentRepository,
  FeedRepository,
  ManufacturerRepository,
  MessageRepository,
  NotificationRepository,
  ProductRepository,
  RfqRepository,
  SessionRepository,
  FactoryRepository,
  MessageItem,
} from "@/shared/api/contracts";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import {
  categories,
  conversations,
  factoryRfqs,
  manufacturers,
  mockComments,
  notifications,
  products,
  reels,
} from "@/shared/mocks/fixtures";
import { childrenOf, rootCategories } from "@/shared/mocks/machinery-taxonomy";
import {
  buildPayload,
  clearBrowserCookie,
  parseSessionCookie,
  payloadToProfile,
  readBrowserCookie,
  SESSION_COOKIE,
  writeBrowserCookie,
  type JoinInput,
} from "@/features/auth/session-cookie";

function delay<T>(value: T, ms = 40): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const session: SessionRepository = {
  async getCurrentUser() {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const jar = await cookies();
      const payload = parseSessionCookie(jar.get(SESSION_COOKIE)?.value);
      return delay(payload ? payloadToProfile(payload) : null);
    }
    const payload = readBrowserCookie();
    return delay(payload ? payloadToProfile(payload) : null);
  },
  async join(input: JoinInput) {
    const payload = buildPayload(input);
    writeBrowserCookie(payload);
    return delay(payloadToProfile(payload));
  },
  async login(input: JoinInput) {
    const payload = buildPayload(input);
    writeBrowserCookie(payload);
    return delay(payloadToProfile(payload));
  },
  async logout() {
    clearBrowserCookie();
    return delay(undefined);
  },
  async updateProfile(input) {
    const payload = readBrowserCookie();
    if (payload) {
      const updated = {
        ...payload,
        name: input.name || payload.name,
        companyName: input.companyName || payload.companyName,
      };
      writeBrowserCookie(updated);
      return delay(payloadToProfile(updated));
    }
    return delay({
      id: "mock-user",
      name: input.name || "Member",
      role: "Buyer" as const,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      companyName: input.companyName || "Global Industrial",
      industry: input.industry || "Machinery",
      country: input.country || "India",
    });
  },
};

const feed: FeedRepository = {
  async list(tab) {
    const list =
      tab === "following"
        ? reels.filter((r) => ["mfr-apex", "mfr-bharat", "mfr-metalcraft"].includes(r.manufacturerId))
        : reels;

    const items = list.map((reel) => {
      const manufacturer = manufacturers.find((item) => item.id === reel.manufacturerId);
      if (!manufacturer) {
        throw new Error(`Missing manufacturer for reel ${reel.id}`);
      }
      const reelProducts = products.filter((item) => reel.productIds.includes(item.id));
      return {
        reel,
        manufacturer,
        primaryProductSlug: products.find((item) => item.id === reel.productIds[0])?.slug,
        products: reelProducts,
      };
    });
    return delay(items);
  },
  async addReel(reel) {
    reels.unshift(reel);
    return delay(undefined);
  },
  likeReel: () => delay({ liked: true, likesCount: 43 }),
  saveReel: () => delay({ saved: true, savesCount: 15 }),
  async recordView(reelId) {
    const reel = reels.find((item) => item.id === reelId);
    if (reel) reel.views += 1;
    return delay(undefined);
  },
};

const manufacturerRepo: ManufacturerRepository = {
  listVerified: (limit = 6) =>
    delay(manufacturers.filter((item) => item.verified).slice(0, limit)),
  listAll: () => delay(manufacturers),
  async getBySlug(slug) {
    const manufacturer = manufacturers.find((item) => item.slug === slug);
    if (!manufacturer) return delay(null);
    return delay({
      manufacturer,
      products: products.filter((item) => item.manufacturerId === manufacturer.id),
      reels: reels.filter((item) => item.manufacturerId === manufacturer.id),
    });
  },
};

const productRepo: ProductRepository = {
  listTrending: (limit = 6) => delay(products.slice(0, limit)),
  async getBySlug(slug) {
    const product = products.find((item) => item.slug === slug);
    if (!product) return delay(null);
    const manufacturer = manufacturers.find((item) => item.id === product.manufacturerId);
    if (!manufacturer) return delay(null);
    return delay({ product, manufacturer });
  },
  listByCategory: (categoryId) =>
    delay(
      products.filter((item) => {
        if (item.categoryId === categoryId) return true;
        const selected = categories.find((category) => category.id === categoryId);
        if (!selected || selected.parentId !== null) return false;
        const productCategory = categories.find((category) => category.id === item.categoryId);
        return productCategory?.parentId === selected.id;
      }),
    ),
  async addProduct(product) {
    products.unshift(product);
    return delay(undefined);
  },
  // Mock mode has no event store; product views are only tracked by the real backend.
  recordView: () => delay(undefined),
};

const messages: MessageRepository = {
  async listRecent(limit = 8) {
    const items = conversations.slice(0, limit).map((conversation) => {
      const manufacturer = manufacturers.find((item) => item.id === conversation.manufacturerId);
      if (!manufacturer) {
        throw new Error(`Missing manufacturer for conversation ${conversation.id}`);
      }
      return { ...conversation, manufacturer };
    });
    return delay(items);
  },
  async getMessages(conversationId: string) {
    return delay([
      {
        id: `mock-msg-1-${conversationId}`,
        conversationId,
        sender: "factory" as const,
        text: "Hello! Welcome to our manufacturing plant. How can our engineering team assist you today?",
        time: "10:30 AM",
      },
    ]);
  },
  async sendMessage(conversationId: string, text: string, attachment?: { name: string; size: string; url?: string }) {
    return delay({
      id: `mock-msg-${Date.now()}`,
      conversationId,
      sender: "user" as const,
      text,
      time: "Just now",
      attachment,
    });
  },
  async markAsRead(conversationId: string) {
    return delay(undefined);
  },
  onMessageStream(conversationId: string, callback: (message: MessageItem) => void) {
    return () => {};
  },
  async startConversation(manufacturerId: string, initialMessage?: string) {
    const mfg = manufacturers.find((m) => m.id === manufacturerId) || manufacturers[0];
    const newConv = {
      id: `conv-${Date.now()}`,
      manufacturerId: mfg.id,
      lastMessage: initialMessage || "Hello",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      manufacturer: mfg,
    };
    return delay(newConv);
  },
};

const categoryRepo: CategoryRepository = {
  list: () => delay(categories),
  listRoots: () => delay(rootCategories),
  async listChildren(parentIdOrSlug) {
    const parent =
      categories.find((item) => item.id === parentIdOrSlug) ??
      categories.find((item) => item.slug === parentIdOrSlug);
    if (!parent) return delay([]);
    return delay(childrenOf(parent.id));
  },
  getBySlug: (slug) => delay(categories.find((item) => item.slug === slug) ?? null),
};

const notificationRepo: NotificationRepository = {
  list: () => delay(notifications),
  unreadCount: () => delay(notifications.filter((item) => !item.read).length),
  markAllAsRead: () => delay(undefined),
  markAsRead: () => delay(undefined),
  deleteNotification: () => delay(undefined),
};

const rfq: RfqRepository = {
  submit: async (_draft) => delay({
    ok: true as const,
    id: `rfq-${Date.now()}`,
    referenceNumber: `RFQ-2026-${Math.floor(100000 + Math.random() * 900000)}`,
  }),
  listMyRfqs: async () => delay([]),
};

let dynamicComments: ReelComment[] = [...mockComments];

const commentsRepo: CommentRepository = {
  async listByReelId(reelId: string) {
    const items = dynamicComments
      .filter((c) => c.reelId === reelId)
      .map((c) => ({ ...c, replies: [...c.replies] }));
    return delay(items);
  },
  async addComment(reelId, content, user) {
    const newComment: ReelComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reelId,
      authorName: user?.name || "Arjun Mehta",
      authorAvatarUrl:
        user?.avatarUrl ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      authorCompany: user?.companyName || "Mehta Industrial Sourcing",
      authorCountry: "India",
      isVerified: true,
      content,
      createdAt: "Just now",
      likes: 0,
      replies: [],
    };
    dynamicComments = [newComment, ...dynamicComments];
    const reel = reels.find((r) => r.id === reelId);
    if (reel) reel.comments += 1;
    return delay({ ...newComment, replies: [] });
  },
  async addReply(commentId, content, user) {
    const newReply: ReelCommentReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorName: user?.name || "Arjun Mehta",
      authorAvatarUrl:
        user?.avatarUrl ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      authorCompany: user?.companyName || "Mehta Industrial Sourcing",
      authorCountry: "India",
      isVerified: true,
      content,
      createdAt: "Just now",
      likes: 0,
    };
    const target = dynamicComments.find((c) => c.id === commentId);
    if (target) {
      target.replies = [...target.replies, newReply];
      const reel = reels.find((r) => r.id === target.reelId);
      if (reel) reel.comments += 1;
    }
    return delay({ ...newReply });
  },
};

// Mock mode has no supplier→factory mapping, so every signed-in manufacturer
// manages the first fixture factory. Mutations write to the shared fixtures so
// buyer pages (/, /explore, /products/[slug]) see them — call these from the
// server (see features/factory/actions.ts), not the browser.
const ownFactory = () => manufacturers[0];

function uniqueProductSlug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
  let slug = base;
  for (let n = 2; products.some((item) => item.slug === slug); n++) slug = `${base}-${n}`;
  return slug;
}

function removeWhere<T>(list: T[], match: (item: T) => boolean) {
  const index = list.findIndex(match);
  if (index >= 0) list.splice(index, 1);
}

const factoryRepo: FactoryRepository = {
  getProfile: () => delay(ownFactory()),
  async updateProfile(data) {
    // Identity and trust flags are not seller-editable.
    const editable = { ...data };
    delete editable.id;
    delete editable.slug;
    delete editable.verified;
    delete editable.premium;
    Object.assign(ownFactory(), editable);
    return delay({ ...ownFactory() });
  },
  // Derived from fixtures only; values mock mode cannot know (period change, quote timing) stay null.
  async getStats() {
    const mfrId = ownFactory().id;
    const ownReels = reels.filter((item) => item.manufacturerId === mfrId);
    const active = factoryRfqs.filter((item) => ["SUBMITTED", "QUOTED"].includes(item.status));
    const quoted = factoryRfqs.filter((item) => item.status === "QUOTED");
    return delay({
      periodDays: 30,
      videoSeekPlays: ownReels.reduce((sum, item) => sum + item.views, 0),
      videoPlaysChange: null,
      totalProductViews: 0,
      productViewsChange: null,
      factoryProfileVisits: 0,
      profileVisitsChange: null,
      activeRfqsCount: active.length,
      pendingRfqsCount: active.filter((item) => item.status !== "QUOTED").length,
      responseRatePercent: factoryRfqs.length
        ? Math.round((1000 * quoted.length) / factoryRfqs.length) / 10
        : null,
      avgResponseTimeHours: null,
      responseWindowDays: 90,
      followerCount: ownFactory().followerCount,
      totalProductsCount: products.filter((item) => item.manufacturerId === mfrId).length,
      totalSeeksCount: ownReels.length,
    });
  },
  async uploadMedia(file, kind) {
    if (typeof window === "undefined") {
      throw new Error("uploadMedia must be called from the browser");
    }
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const res = await fetch("/api/mock-media", { method: "POST", body });
    const json = (await res.json().catch(() => null)) as
      | { success: boolean; message?: string; data: Awaited<ReturnType<FactoryRepository["uploadMedia"]>> }
      | null;
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || `Upload failed (HTTP ${res.status})`);
    }
    return json.data;
  },
  getProducts: () => delay(products.filter((item) => item.manufacturerId === ownFactory().id)),
  async addProduct(data) {
    const product = {
      id: `prd-${Date.now()}`,
      manufacturerId: ownFactory().id,
      name: data.name,
      slug: uniqueProductSlug(data.name),
      imageUrl: data.imageUrl,
      description: data.description || "",
      priceInr: data.priceInr,
      unit: data.unit || "Piece",
      moq: data.moq || "1 Piece",
      categoryId: data.categoryId,
      specs: data.specs || {},
    };
    products.unshift(product);
    return delay(product);
  },
  async deleteProduct(id) {
    removeWhere(products, (item) => item.id === id && item.manufacturerId === ownFactory().id);
    return delay(undefined);
  },
  getSeeks: () => delay(reels.filter((item) => item.manufacturerId === ownFactory().id)),
  async addSeek(data) {
    const reel = {
      id: `reel-${Date.now()}`,
      manufacturerId: ownFactory().id,
      title: data.title,
      description: data.description || "",
      hashtags: data.hashtags || [],
      posterUrl: data.posterUrl,
      videoUrl: data.videoUrl,
      durationSec: data.durationSec || 30,
      startSec: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      tab: "for-you" as const,
      productIds: data.productIds || [],
      categoryIds: data.categoryIds,
    };
    reels.unshift(reel);
    return delay(reel);
  },
  async deleteSeek(id) {
    removeWhere(reels, (item) => item.id === id && item.manufacturerId === ownFactory().id);
    return delay(undefined);
  },
  getRfqs: () => delay(factoryRfqs.map((item) => ({ ...item }))),
  async submitQuote(rfqId, quote) {
    const target = factoryRfqs.find((item) => item.id === rfqId);
    if (!target) throw new Error(`RFQ ${rfqId} not found`);
    target.status = "QUOTED";
    target.quotedPriceInr = quote.quotePrice;
    target.leadTimeDays = quote.leadTimeDays;
    return delay(undefined);
  },
};

export const mockApi: ApiClient = {
  session,
  feed,
  manufacturers: manufacturerRepo,
  products: productRepo,
  messages,
  categories: categoryRepo,
  notifications: notificationRepo,
  rfq,
  comments: commentsRepo,
  factory: factoryRepo,
};
