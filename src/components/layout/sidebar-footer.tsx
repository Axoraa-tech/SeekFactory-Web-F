"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/shared/config/company";
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
      {/* Contact Us, carried over from the previous site's footer */}
      <address className="mb-3 space-y-1.5 rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-left not-italic leading-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink">Contact Us</p>
        <p className="flex items-start gap-2">
          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
          <a href={`mailto:${COMPANY.email}`} className="break-all text-ink hover:text-brand-blue hover:underline">{COMPANY.email}</a>
        </p>
        <p className="flex items-start gap-2">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
          <span className="flex flex-wrap gap-x-2">
            {COMPANY.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="text-ink hover:text-brand-blue hover:underline">{p.label}</a>
            ))}
          </span>
        </p>
        {COMPANY.offices.map((office) => (
          <p key={office} className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
            <span>{office}</span>
          </p>
        ))}
      </address>
      <nav className="flex flex-wrap justify-center gap-x-3">
        <Link href="/about" className="hover:text-brand-blue hover:underline">
          {t("layout.footer.about")}
        </Link>
        <Link href="/about#contact" className="hover:text-brand-blue hover:underline">
          Contact Us
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
        className="sf-btn-soft inline-flex items-center gap-0.5 hover:text-brand-blue hover:underline"
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
