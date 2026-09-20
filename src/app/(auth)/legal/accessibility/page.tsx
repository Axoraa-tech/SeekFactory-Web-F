import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <Card className="max-w-xl p-6">
      <PageHeader
        title="Accessibility"
        description="SeekFactory aims to be usable on desktop and mobile for buyers and manufacturers."
      />
      <p className="text-sm leading-relaxed text-ink-muted">
        This is a placeholder statement. Production will follow WCAG-oriented labels, keyboard access, and
        contrast on primary actions. Report issues to support@seekfactory.com.
      </p>
    </Card>
  );
}
