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
  OrderRepository,
  MessageItem,
  AccountRepository,
} from "@/shared/api/contracts";
import type { ReelComment, ReelCommentReply } from "@/entities/comment";
import type { OrderRequest } from "@/entities/order";
import {
  categories,
  conversations,
  factoryRfqs,
  factoryVerification,
  orderRequests,
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

/** Buyer-facing: products and seeks the seller has not paused. */
const isListed = (item: { listed?: boolean }) => item.listed !== false;

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
    const visible = products.filter(isListed);

    const items = list.filter(isListed).map((reel) => {
      const manufacturer = manufacturers.find((item) => item.id === reel.manufacturerId);
      if (!manufacturer) {
        throw new Error(`Missing manufacturer for reel ${reel.id}`);
      }
      const reelProducts = visible.filter((item) => reel.productIds.includes(item.id));
      return {
        reel,
        manufacturer,
        primaryProductSlug: visible.find((item) => item.id === reel.productIds[0])?.slug,
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
      products: products.filter((item) => item.manufacturerId === manufacturer.id && isListed(item)),
      reels: reels.filter((item) => item.manufacturerId === manufacturer.id && isListed(item)),
    });
  },
};

const productRepo: ProductRepository = {
  listTrending: (limit = 6) => delay(products.filter(isListed).slice(0, limit)),
  async getBySlug(slug) {
    const product = products.find((item) => item.slug === slug && isListed(item));
    if (!product) return delay(null);
    const manufacturer = manufacturers.find((item) => item.id === product.manufacturerId);
    if (!manufacturer) return delay(null);
    return delay({ product, manufacturer });
  },
  listByCategory: (categoryId) =>
    delay(
      products.filter((item) => {
        if (!isListed(item)) return false;
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
  async sendMessage(conversationId, text, attachment, context) {
    const order = context?.orderId ? orderRequests.find((item) => item.id === context.orderId) : undefined;
    return delay({
      id: `mock-msg-${Date.now()}`,
      conversationId,
      sender: "user" as const,
      text,
      time: new Date().toISOString(),
      attachment,
      order: order && {
        id: order.id,
        referenceNumber: order.referenceNumber,
        productName: order.productName,
        productSlug: order.productSlug,
        quantity: order.quantity,
        unit: order.unit,
        status: order.status,
      },
    });
  },
  async uploadAttachment(_conversationId, file) {
    if (typeof window === "undefined") throw new Error("uploadAttachment must be called from the browser");
    const body = new FormData();
    body.append("file", file);
    body.append("kind", file.type === "application/pdf" ? "document" : "image");
    const res = await fetch("/api/mock-media", { method: "POST", body });
    const json = (await res.json().catch(() => null)) as
      | { success: boolean; message?: string; data: { url: string; contentType: string; size: number } }
      | null;
    if (!res.ok || !json?.success) throw new Error(json?.message || `Upload failed (HTTP ${res.status})`);
    const kb = json.data.size / 1024;
    return {
      url: json.data.url,
      name: file.name,
      size: kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`,
      contentType: json.data.contentType,
    };
  },
  async listConversationOrders(conversationId) {
    const conversation = conversations.find((item) => item.id === conversationId);
    return delay(orderRequests.filter((item) => item.manufacturer.id === conversation?.manufacturerId));
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

function ownProduct(id: string) {
  const product = products.find((item) => item.id === id && item.manufacturerId === ownFactory().id);
  if (!product) throw new Error("Product not found");
  return product;
}

function ownReel(id: string) {
  const reel = reels.find((item) => item.id === id && item.manufacturerId === ownFactory().id);
  if (!reel) throw new Error("Seek not found");
  return reel;
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
      imageUrls: data.imageUrls?.length ? data.imageUrls : [data.imageUrl],
      datasheetUrl: data.datasheetUrl || undefined,
      datasheetName: data.datasheetUrl ? data.datasheetName || "Datasheet.pdf" : undefined,
      listed: true,
    };
    if (data.imageUrls?.length) product.imageUrl = data.imageUrls[0];
    products.unshift(product);
    return delay(product);
  },
  async updateProduct(id, data) {
    const product = ownProduct(id);
    if (data.name !== undefined) product.name = data.name;
    if (data.imageUrls?.length) {
      product.imageUrls = [...data.imageUrls];
      product.imageUrl = data.imageUrls[0];
    }
    if (data.description !== undefined) product.description = data.description;
    if (data.priceInr !== undefined) product.priceInr = data.priceInr;
    if (data.unit) product.unit = data.unit;
    if (data.moq) product.moq = data.moq;
    if (data.categoryId) product.categoryId = data.categoryId;
    if (data.specs) product.specs = { ...data.specs };
    if (data.datasheetUrl !== undefined) {
      product.datasheetUrl = data.datasheetUrl || undefined;
      product.datasheetName = data.datasheetUrl ? data.datasheetName || "Datasheet.pdf" : undefined;
    }
    return delay({ ...product });
  },
  async setProductListed(id, listed) {
    const product = ownProduct(id);
    product.listed = listed;
    return delay({ ...product });
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
  async updateSeek(id, data) {
    const reel = ownReel(id);
    if (data.title !== undefined) reel.title = data.title;
    if (data.description !== undefined) reel.description = data.description;
    if (data.posterUrl) reel.posterUrl = data.posterUrl;
    if (data.videoUrl) reel.videoUrl = data.videoUrl;
    if (data.durationSec) reel.durationSec = data.durationSec;
    if (data.hashtags) reel.hashtags = [...data.hashtags];
    if (data.productIds) reel.productIds = [...data.productIds];
    return delay({ ...reel });
  },
  async setSeekListed(id, listed) {
    const reel = ownReel(id);
    reel.listed = listed;
    return delay({ ...reel });
  },
  getVerification: () => delay({ ...factoryVerification }),
  async submitVerification(data) {
    if (factoryVerification.status === "APPROVED" && factoryVerification.submitted) {
      throw new Error("Your factory is already verified");
    }
    Object.assign(factoryVerification, {
      ...data,
      status: "PENDING",
      submitted: true,
      submittedAt: new Date().toISOString(),
      rejectionReason: undefined,
    });
    return delay({ ...factoryVerification });
  },
  async openRfqConversation(rfqId) {
    const rfqItem = factoryRfqs.find((item) => item.id === rfqId);
    if (!rfqItem) throw new Error("RFQ not found");
    const buyerId = `buyer-${rfqItem.id}`;
    const existing = conversations.find(
      (item) => item.manufacturerId === ownFactory().id && item.buyerId === buyerId,
    );
    if (existing) return delay({ ...existing });
    const created = {
      id: `conv-${Date.now()}`,
      manufacturerId: ownFactory().id,
      buyerId,
      buyerName: rfqItem.buyerName || rfqItem.companyName || "Buyer",
      buyerCompany: rfqItem.companyName,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    conversations.unshift(created);
    return delay({ ...created });
  },
  async deleteSeek(id) {
    removeWhere(reels, (item) => item.id === id && item.manufacturerId === ownFactory().id);
    return delay(undefined);
  },
  getRfqs: () => delay(factoryRfqs.map((item) => ({ ...item }))),
  async submitQuote(rfqId, quote) {
    const target = factoryRfqs.find((item) => item.id === rfqId);
    if (!target) throw new Error(`RFQ ${rfqId} not found`);
    if (["ACCEPTED", "IN_PRODUCTION", "COMPLETED", "CANCELLED"].includes(target.status)) {
      throw new Error("This RFQ is closed and no longer accepts quotes");
    }
    target.status = "QUOTED";
    target.quotedPriceInr = quote.quotePrice;
    target.leadTimeDays = quote.leadTimeDays;
    target.quoteIncoterm = quote.incoterm;
    target.quoteNotes = quote.notes;
    target.quotedAt ??= new Date().toISOString();
    return delay(undefined);
  },
  getOrders: () =>
    delay(orderRequests.filter((item) => item.manufacturer.id === ownFactory().id).map((item) => ({ ...item }))),
  async openOrderConversation(orderId) {
    const order = orderRequests.find((item) => item.id === orderId && item.manufacturer.id === ownFactory().id);
    if (!order) throw new Error("Order not found");
    const existing = conversations.find(
      (item) => item.manufacturerId === ownFactory().id && item.buyerId === order.buyer.id,
    );
    if (existing) return delay({ ...existing });
    const created = {
      id: `conv-${Date.now()}`,
      manufacturerId: ownFactory().id,
      buyerId: order.buyer.id,
      buyerName: order.buyer.name,
      buyerCompany: order.buyer.companyName,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    conversations.unshift(created);
    return delay({ ...created });
  },
  async updateOrderStatus(orderId, status, note) {
    const order = orderRequests.find((item) => item.id === orderId && item.manufacturer.id === ownFactory().id);
    if (!order) throw new Error("Order not found");
    if (order.status !== status) order.statusUpdatedAt = new Date().toISOString();
    order.status = status;
    order.sellerNote = note?.trim() || undefined;
    return delay({ ...order });
  },
};

// Mock mode: the buyer is whoever holds the demo session cookie. Call from the server
// (features/orders/actions.ts) so orders land in the same fixtures /factory reads.
const ordersRepo: OrderRepository = {
  async place(input) {
    const user = await session.getCurrentUser();
    if (!user) throw new Error("Sign in to place an order");
    const product = products.find((item) => item.slug === input.productSlug);
    if (!product) throw new Error("Product not found");
    const manufacturer = manufacturers.find((item) => item.id === product.manufacturerId);
    if (!manufacturer) throw new Error("Manufacturer not found");
    const now = new Date().toISOString();
    const order: OrderRequest = {
      id: `ord-${Date.now()}`,
      referenceNumber: `ORD-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "PENDING",
      statusUpdatedAt: now,
      createdAt: now,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unitPriceInr: product.priceInr,
      unit: product.unit,
      quantity: input.quantity,
      estimatedTotalInr: product.priceInr * input.quantity,
      buyerNote: input.note?.trim() || undefined,
      manufacturer: { id: manufacturer.id, name: manufacturer.name, slug: manufacturer.slug },
      buyer: {
        id: user.id,
        name: user.name,
        companyName: user.companyName,
        country: user.country,
        email: user.email,
        phone: user.phone,
      },
    };
    orderRequests.unshift(order);
    return delay({ ...order, buyer: { ...order.buyer, email: undefined, phone: undefined } });
  },
  async listMine() {
    const user = await session.getCurrentUser();
    return delay(
      orderRequests
        .filter((item) => item.buyer.id === user?.id)
        .map((item) => ({ ...item, buyer: { ...item.buyer, email: undefined, phone: undefined } })),
    );
  },
};

// Mock mode has no accounts or email: the flows succeed so the UI can be exercised.
const accountRepo: AccountRepository = {
  changePassword: () => delay(undefined),
  sendEmailVerification: () => delay(undefined),
  requestPasswordReset: () => delay(undefined),
  resetPassword: () => delay(undefined),
  verifyEmail: () => delay(undefined),
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
  orders: ordersRepo,
  account: accountRepo,
};
