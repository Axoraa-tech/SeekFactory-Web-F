import { getApi } from "@/shared/api";

export async function loadBuyerShellData() {
  const api = getApi();
  const [user, categories, allCategories, manufacturers, products, messages, notificationCount] = await Promise.all([
    api.session.getCurrentUser(),
    api.categories.listRoots(),
    api.categories.list().catch(() => []),
    api.manufacturers.listVerified(4),
    api.products.listTrending(6),
    api.messages.listRecent(3),
    api.notifications.unreadCount(),
  ]);

  const messageCount = user
    ? messages.reduce((sum, item) => sum + item.unreadCount, 0)
    : 0;
  const visibleNotificationCount = user ? notificationCount : 0;

  const categoriesWithChildren = await Promise.all(
    categories.map(async (category) => {
      let children = await api.categories.listChildren(category.id).catch(() => []);
      if (!children || children.length === 0) {
        children = await api.categories.listChildren(category.slug).catch(() => []);
      }
      if ((!children || children.length === 0) && allCategories.length > 0) {
        children = allCategories.filter(
          (c) => c.parentId === category.id || c.parentId === category.slug
        );
      }
      return { ...category, subcategories: children };
    })
  );

  return {
    user,
    categories: categoriesWithChildren,
    allCategories,
    manufacturers,
    products,
    messages,
    messageCount,
    notificationCount: visibleNotificationCount,
  };
}
