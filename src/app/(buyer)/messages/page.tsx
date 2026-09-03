import { InteractiveChatApp } from "@/components/messages/interactive-chat-app";
import { getApi } from "@/shared/api";
import { requireUser } from "@/features/auth/require-user";

export default async function MessagesPage() {
  await requireUser("/messages");
  const [threads, allManufacturers] = await Promise.all([
    getApi().messages.listRecent(10),
    getApi().manufacturers.listAll(),
  ]);

  return (
    <section className="space-y-3">
      <InteractiveChatApp
        initialThreads={threads}
        allManufacturers={allManufacturers}
      />
    </section>
  );
}

