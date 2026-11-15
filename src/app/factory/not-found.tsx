import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FactoryNotFound() {
  const t = useTranslations();
  return (
    <section className="mx-auto my-8 max-w-xl rounded-card border border-line bg-surface p-8 text-center">
      <h1 className="text-xl font-bold">{t("notFound.pageNotFound")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("notFound.thisFactoryOrProductIs")}</p>
      <Link href="/factory" className="mt-4 inline-block text-sm font-semibold text-brand-blue">
        {t("seller.preview.backToSellerHub")}
      </Link>
    </section>
  );
}
