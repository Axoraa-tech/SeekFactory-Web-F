import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.cookies.title") };
}

export default function CookiesPage() {
  const t = useTranslations();
  return (
    <Card className="max-w-xl p-6">
      <PageHeader title={t("layout.footer.cookiePolicy")} description={t("legal.cookies.description")} />
      <p className="text-sm leading-relaxed text-ink-muted">
        {t("legal.cookies.bodyLead")} <code>sf-session</code> {t("legal.cookies.body")}
      </p>
    </Card>
  );
}
