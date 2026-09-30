import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.privacy.title") };
}

export default function PrivacyPage() {
  const t = useTranslations();
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title={t("layout.footer.privacyPolicy")} description={t("legal.privacy.description")} />
      <p className="text-sm leading-relaxed text-ink-muted">
        {t("legal.privacy.body")}
      </p>
    </Card>
  );
}
