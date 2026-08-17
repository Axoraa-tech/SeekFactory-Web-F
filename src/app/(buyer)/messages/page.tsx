import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getApi } from "@/shared/api";
import { requireUser } from "@/features/auth/require-user";

export default async function MessagesPage() {
  await requireUser("/messages");
  const threads = await getApi().messages.listRecent(8);

  return (
    <section>
      <PageHeader title="Messages" description="Chat with manufacturers. Realtime is mocked in this FE build." />
      <Card className="divide-y divide-line overflow-hidden">
        {threads.map((thread) => (
          <article key={thread.id} className="flex gap-3 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thread.manufacturer.logoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate font-semibold">{thread.manufacturer.name}</h2>
                <span className="text-xs text-ink-faint">{thread.lastMessageAt}</span>
              </div>
              <p className="truncate text-sm text-ink-muted">{thread.lastMessage}</p>
            </div>
            {thread.unreadCount > 0 ? (
              <span className="h-fit rounded-full bg-brand-blue px-2 py-0.5 text-xs font-bold text-white">
                {thread.unreadCount}
              </span>
            ) : null}
          </article>
        ))}
      </Card>
    </section>
  );
}
