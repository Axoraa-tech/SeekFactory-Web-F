import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title="Cookie Policy" description="This demo stores a local session cookie only." />
      <p className="text-sm leading-relaxed text-ink-muted">
        The <code>sf-session</code> cookie keeps your mock Buyer or Manufacturer role in the browser. It is not used
        for advertising. Production analytics will use a China-legal option, not Google Analytics by default.
      </p>
    </Card>
  );
}
