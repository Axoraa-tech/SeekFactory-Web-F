import type {
  ApiClient,
  CategoryRepository,
  FeedRepository,
  ManufacturerRepository,
  MessageRepository,
  NotificationRepository,
  ProductRepository,
  RfqRepository,
  SessionRepository,
} from "@/shared/api/contracts";
import {
  categories,
  conversations,
  manufacturers,
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
};

const feed: FeedRepository = {
  async list(tab) {
    const items = reels
      .filter((reel) => reel.tab === tab)
      .map((reel) => {
        const manufacturer = manufacturers.find((item) => item.id === reel.manufacturerId);
        if (!manufacturer) {
          throw new Error(`Missing manufacturer for reel ${reel.id}`);
        }
        return {
          reel,
          manufacturer,
          primaryProductSlug: products.find((item) => item.id === reel.productIds[0])?.slug,
        };
      });
    return delay(items);
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
};

const rfq: RfqRepository = {
  submit: async () => delay({ ok: true as const, id: `rfq-${Date.now()}` }),
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
};
