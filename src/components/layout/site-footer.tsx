"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white pt-10 pb-12 text-slate-600">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <BrandLogo className="h-8 sm:h-10 w-auto object-contain object-left" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Global industrial B2B network connecting verified manufacturing facilities, OEM precision engineering, and verified buyers worldwide.
            </p>
          </div>

          {/* About & Sourcing */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">About & Sourcing</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/explore" className="hover:text-brand-blue hover:underline transition-colors">
                  About SeekFactory
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-brand-blue hover:underline transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/legal/accessibility" className="hover:text-brand-blue hover:underline transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-brand-blue hover:underline transition-colors">
                  Get the SeekFactory App
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Factories */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">For Business</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/join?role=manufacturer" className="hover:text-brand-blue hover:underline transition-colors">
                  For Manufacturers & Suppliers
                </Link>
              </li>
              <li>
                <Link href="/join?role=manufacturer" className="hover:text-brand-blue hover:underline transition-colors">
                  Advertising & Sponsored Listings
                </Link>
              </li>
              <li>
                <Link href="/rfq/new" className="hover:text-brand-blue hover:underline transition-colors">
                  Post Custom RFQ
                </Link>
              </li>
              <li>
                <Link href="/factory" className="hover:text-brand-blue hover:underline transition-colors">
                  Factory Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Privacy & Terms</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/legal/privacy" className="hover:text-brand-blue hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-brand-blue hover:underline transition-colors">
                  User Agreement
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-brand-blue hover:underline transition-colors">
                  Cookie Policy & Ad Choices
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-brand-blue hover:underline transition-colors">
                  Explore Directory
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & quick links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>SeekFactory © {currentYear} · Green Factories Worldwide. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/explore" className="hover:text-brand-blue hover:underline">About</Link>
            <span>·</span>
            <Link href="/legal/accessibility" className="hover:text-brand-blue hover:underline">Accessibility</Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-brand-blue hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/legal/terms" className="hover:text-brand-blue hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/legal/cookies" className="hover:text-brand-blue hover:underline">Ad Choices</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
