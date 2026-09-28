import { getApi } from "@/shared/api";
import { buildCategoryTree } from "@/features/categories/category-tree";

export async function loadBuyerShellData() {
  const api = getApi();
  const [user, allCategories, manufacturers, products, messages, notificationCount] = await Promise.all([
    api.session.getCurrentUser(),
    api.categories.list(),
    api.manufacturers.listVerified(4),
    api.products.listTrending(6),
    api.messages.listRecent(3),
    api.notifications.unreadCount(),
  ]);

  const messageCount = user
    ? messages.reduce((sum, item) => sum + item.unreadCount, 0)
    : 0;
  const visibleNotificationCount = user ? notificationCount : 0;

  // One categories request; children are grouped client-side instead of one request per root
  const { roots, childrenByRoot } = buildCategoryTree(allCategories);
  const categories = roots.map((category) => ({ ...category, subcategories: childrenByRoot[category.id] }));

  return {
    user,
    categories,
    allCategories,
    manufacturers,
    products,
    messages,
    messageCount,
    notificationCount: visibleNotificationCount,
  };
}
