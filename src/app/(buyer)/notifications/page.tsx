import { InteractiveNotificationsCenter } from "@/components/notifications/interactive-notifications-center";
import { getApi } from "@/shared/api";
import { requireUser } from "@/features/auth/require-user";

export default async function NotificationsPage() {
  await requireUser("/notifications");
  const items = await getApi().notifications.list();

  return (
    <section className="space-y-4">
      <InteractiveNotificationsCenter initialNotifications={items} />
    </section>
  );
}

