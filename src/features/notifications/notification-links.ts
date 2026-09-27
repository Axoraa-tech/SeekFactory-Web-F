import type { AppNotification } from "@/entities/notification";

/** The page a notification is about, from its type and reference id. */
export function notificationHref(n: AppNotification): string {
  const ref = n.referenceId ? encodeURIComponent(n.referenceId) : "";
  switch (n.type) {
    case "quote":
    case "rfq":
      return ref ? `/profile?tab=rfqs&rfq=${ref}` : "/profile?tab=rfqs";
    case "order":
      return ref ? `/orders#${ref}` : "/orders";
    case "message":
      return ref ? `/messages?conversation=${ref}` : "/messages";
    case "follow":
      return "/profile";
    default:
      return "/notifications";
  }
}
