import { InteractiveChatAppLazy } from "@/components/messages/interactive-chat-app-lazy";
import { getApi } from "@/shared/api";
import { inquiryReturnPath } from "@/features/auth/inquiry-return-path";
import { requireUser } from "@/features/auth/require-user";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MessagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await requireUser(inquiryReturnPath("/messages", params));
  const [threads, allManufacturers] = await Promise.all([
    getApi().messages.listRecent(10),
    getApi().manufacturers.listAll(),
  ]);

  return (
    <section className="space-y-3">
      <InteractiveChatAppLazy
        currentUser={user}
        initialThreads={threads}
        allManufacturers={allManufacturers}
      />
    </section>
  );
}
