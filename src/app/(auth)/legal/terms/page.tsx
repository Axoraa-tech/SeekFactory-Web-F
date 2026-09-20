import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "User Agreement" };

export default function TermsPage() {
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title="User Agreement" description="Placeholder for SeekFactory terms. Legal copy comes later." />
      <p className="text-sm leading-relaxed text-ink-muted">
        By joining SeekFactory you agree to use the marketplace to source or supply industrial machinery in good
        faith. This page is a frontend stub until counsel provides the live agreement.
      </p>
    </Card>
  );
}
