import { getApi } from "@/shared/api";

export async function loadBuyerShellData() {
  const api = getApi();
  const [user, categories, manufacturers, products, messages, notificationCount] = await Promise.all([
    api.session.getCurrentUser(),
    api.categories.listRoots(),
    api.manufacturers.listVerified(4),
    api.products.listTrending(6),
    api.messages.listRecent(3),
    api.notifications.unreadCount(),
  ]);

  const messageCount = user
    ? messages.reduce((sum, item) => sum + item.unreadCount, 0)
    : 0;
  const visibleNotificationCount = user ? notificationCount : 0;

  return {
    user,
    categories,
    manufacturers,
    products,
    messages,
    messageCount,
    notificationCount: visibleNotificationCount,
  };
}
