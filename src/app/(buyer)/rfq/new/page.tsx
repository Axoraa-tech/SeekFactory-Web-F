import { requireUser } from "@/features/auth/require-user";
import { RfqForm } from "@/features/rfq/rfq-form";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post RFQ | SeekFactory",
};

export default async function NewRfqPage() {
  await requireUser("/rfq/new");
  const categories = await getApi().categories.listRoots();

  return (
    <section className="w-full space-y-4">
      <RfqForm categories={categories} />
    </section>
  );
}
