import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.terms.title") };
}

export default function TermsPage() {
  const t = useTranslations();
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title={t("layout.footer.userAgreement")} description={t("legal.terms.description")} />
      <p className="text-sm leading-relaxed text-ink-muted">
        {t("legal.terms.body")}
      </p>
    </Card>
  );
}
