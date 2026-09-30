"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/shared/lib/cn";
import { getMessages } from "@/shared/lib/messages";
import { useTranslations } from "next-intl";

const year = new Date().getFullYear();
const messages = getMessages("en");

export function SidebarFooter() {
  const t = useTranslations();
  return (
    <footer className="px-2 pb-2 pt-3 text-center text-[12px] leading-6 text-ink-muted">
      <nav className="flex flex-wrap justify-center gap-x-3">
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.about")}
        </Link>
        <Link href="/legal/accessibility" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.accessibility")}
        </Link>
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.helpCenter")}
        </Link>
        <FooterMenu
          label={t("layout.footer.privacyTerms")}
          items={[
            { href: "/legal/privacy", label: t("layout.footer.privacyPolicy") },
            { href: "/legal/terms", label: t("layout.footer.userAgreement") },
            { href: "/legal/cookies", label: t("layout.footer.cookiePolicy") },
          ]}
        />
        <Link href="/legal/cookies" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.adChoices")}
        </Link>
        <Link href="/join?role=manufacturer" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.advertising")}
        </Link>
        <FooterMenu
          label={t("layout.footer.businessServices")}
          items={[
            { href: "/join?role=manufacturer", label: t("layout.footer.forManufacturers") },
            { href: "/rfq/new", label: t("nav.postRfq") },
            { href: "/factory", label: t("layout.footer.factoryHome") },
          ]}
        />
        <Link href="/join" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.getTheSeekfactoryApp")}
        </Link>
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.more")}
        </Link>
      </nav>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-muted">
        <BrandLogo className="h-5 w-auto max-w-[110px] object-contain object-left" />
        <span>
          {messages.brand.name} © {year}
        </span>
      </p>
    </footer>
  );
}

function FooterMenu({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center gap-0.5 hover:text-brand-blue hover:underline"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn("h-3 w-3", open && "rotate-180")} />
      </button>
      {open ? (
        <span className="absolute bottom-full left-1/2 z-20 mb-1 w-44 -translate-x-1/2 rounded-lg border border-line bg-white py-1 text-left shadow-card">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-1.5 text-[12px] text-ink hover:bg-canvas"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </span>
      ) : null}
    </span>
  );
}
