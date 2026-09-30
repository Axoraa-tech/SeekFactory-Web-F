import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.accessibility.title") };
}

export default function AccessibilityPage() {
  const t = useTranslations();
  return (
    <Card className="max-w-xl p-6">
      <PageHeader
        title={t("legal.accessibility.title")}
        description={t("legal.accessibility.description")}
      />
      <p className="text-sm leading-relaxed text-ink-muted">
        {t("legal.accessibility.body")}
      </p>
    </Card>
  );
}
