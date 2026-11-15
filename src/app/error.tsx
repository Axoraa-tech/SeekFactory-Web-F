"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

/** Do not render backend messages, resource identifiers, or stack traces. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();
  return (
    <main role="alert" className="mx-auto my-12 max-w-xl rounded-card border border-line bg-surface p-8 text-center">
      <h1 className="text-xl font-bold">{t("auth.errors.somethingWentWrongPleaseRetry")}</h1>
      <div className="mt-4 flex justify-center gap-4">
        <button type="button" onClick={reset} className="font-semibold text-brand-blue">{t("showcase.single.tryAgain")}</button>
        <Link href="/" className="font-semibold text-brand-blue">{t("notFound.backToSeeks")}</Link>
      </div>
    </main>
  );
}
