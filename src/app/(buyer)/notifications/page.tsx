import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getApi } from "@/shared/api";

export default async function NotificationsPage() {
  const items = await getApi().notifications.list();

  return (
    <section>
      <PageHeader title="Notifications" description="Leads, quotes, and factory activity." />
      <Card className="divide-y divide-line overflow-hidden">
        {items.map((item) => (
          <article key={item.id} className="flex gap-3 p-4">
            <span
              className={
                item.read ? "mt-2 h-2 w-2 rounded-full bg-line" : "mt-2 h-2 w-2 rounded-full bg-brand-blue"
              }
            />
            <div>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="text-sm text-ink-muted">{item.body}</p>
              <p className="mt-1 text-xs text-ink-faint">{item.createdAt}</p>
            </div>
          </article>
        ))}
      </Card>
    </section>
  );
}
