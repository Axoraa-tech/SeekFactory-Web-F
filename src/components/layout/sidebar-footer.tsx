"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/shared/lib/cn";

const year = new Date().getFullYear();

export function SidebarFooter() {
  return (
    <footer className="px-2 pb-2 pt-3 text-center text-[12px] leading-6 text-ink-muted">
      <nav className="flex flex-wrap justify-center gap-x-3">
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          About
        </Link>
        <Link href="/legal/accessibility" className="hover:text-brand-blue hover:underline">
          Accessibility
        </Link>
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          Help Center
        </Link>
        <FooterMenu
          label="Privacy & Terms"
          items={[
            { href: "/legal/privacy", label: "Privacy Policy" },
            { href: "/legal/terms", label: "User Agreement" },
            { href: "/legal/cookies", label: "Cookie Policy" },
          ]}
        />
        <Link href="/legal/cookies" className="hover:text-brand-blue hover:underline">
          Ad Choices
        </Link>
        <Link href="/join?role=manufacturer" className="hover:text-brand-blue hover:underline">
          Advertising
        </Link>
        <FooterMenu
          label="Business Services"
          items={[
            { href: "/join?role=manufacturer", label: "For manufacturers" },
            { href: "/rfq/new", label: "Post RFQ" },
            { href: "/factory", label: "Factory home" },
          ]}
        />
        <Link href="/join" className="hover:text-brand-blue hover:underline">
          Get the SeekFactory app
        </Link>
        <Link href="/explore" className="hover:text-brand-blue hover:underline">
          More
        </Link>
      </nav>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-muted">
        <BrandLogo className="h-5 w-auto max-w-[110px] object-contain object-left" />
        <span>SeekFactory © {year}</span>
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
