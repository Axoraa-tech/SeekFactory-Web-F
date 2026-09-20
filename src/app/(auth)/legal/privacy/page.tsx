import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title="Privacy Policy" description="Placeholder privacy notice for the FE demo." />
      <p className="text-sm leading-relaxed text-ink-muted">
        SeekFactory will store account, inquiry, and factory profile data on the production backend. This mock does
        not send data to a server. China-region processing will follow local requirements when the API ships.
      </p>
    </Card>
  );
}
