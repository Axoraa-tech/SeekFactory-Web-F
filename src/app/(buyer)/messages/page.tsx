import { InteractiveChatAppLazy } from "@/components/messages/interactive-chat-app-lazy";
import { getApi } from "@/shared/api";
import { requireUser } from "@/features/auth/require-user";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireUser("/messages");
  const [threads, allManufacturers] = await Promise.all([
    getApi().messages.listRecent(10),
    getApi().manufacturers.listAll(),
  ]);

  return (
    <section className="space-y-3">
      <InteractiveChatAppLazy
        initialThreads={threads}
        allManufacturers={allManufacturers}
      />
    </section>
  );
}
