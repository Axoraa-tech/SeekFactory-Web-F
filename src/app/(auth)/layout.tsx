import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useTranslations } from "next-intl";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  return (
    <div className="site-canvas flex min-h-screen flex-col">
      <div className="flex justify-end px-4 pt-4 sm:px-6 sm:pt-5">
        <LanguageToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">{children}</main>
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-6 text-xs text-ink-muted">
        <Link href="/explore">{t("layout.footer.about")}</Link>
        <Link href="/legal/terms">{t("layout.footer.userAgreement")}</Link>
        <Link href="/legal/privacy">{t("layout.footer.privacyPolicy")}</Link>
        <Link href="/legal/cookies">{t("layout.footer.cookiePolicy")}</Link>
      </footer>
    </div>
  );
}
