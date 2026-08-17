import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/features/auth/require-user";
import { RfqForm } from "@/features/rfq/rfq-form";
import { getApi } from "@/shared/api";

export const metadata = {
  title: "Post RFQ",
};

export default async function NewRfqPage() {
  await requireUser("/rfq/new");
  const categories = await getApi().categories.listRoots();

  return (
    <section>
      <PageHeader
        title="Post RFQ"
        description="Tell verified factories what you need. This posts to the mock RFQ repository."
      />
      <Card className="max-w-xl p-5">
        <RfqForm categories={categories} />
      </Card>
    </section>
  );
}
