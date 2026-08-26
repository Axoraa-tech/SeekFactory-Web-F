import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SearchBar } from "@/components/layout/search-bar";
import { MessagesDropdown } from "@/components/layout/messages-dropdown";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { LanguageCurrencyDropdown } from "@/components/layout/language-currency-dropdown";
import type { BuyerProfile } from "@/entities/user";
import type { Category } from "@/entities/category";

type Props = {
  user: BuyerProfile | null;
  messageCount: number;
  notificationCount: number;
  categories: Category[];
};

export function TopNav({ user, messageCount, notificationCount, categories }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 shadow-nav backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-3 sm:gap-4 lg:gap-5 px-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center py-1 group" aria-label="SeekFactory home">
          <BrandLogo
            priority
            className="h-11 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Optimized Interactive Search Bar */}
        <SearchBar categories={categories} />

        {/* Right Navigation & User Actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          {user ? (
            <>
              <LanguageCurrencyDropdown />
              <Link
                href="/rfq/new"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-brand-blue-dark active:scale-95 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Post RFQ</span>
              </Link>
              <MessagesDropdown initialCount={messageCount} />
              <NotificationsDropdown initialCount={notificationCount} />
              <UserDropdown
                user={user}
                messageCount={messageCount}
                notificationCount={notificationCount}
              />
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language & Currency selector replacing Explore button */}
              <LanguageCurrencyDropdown />

              <Link
                href="/join?role=manufacturer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-muted hover:text-brand-blue transition-colors rounded-lg hover:bg-canvas"
              >
                <Building2 className="h-4 w-4 text-amber-600" />
                For Suppliers
              </Link>

              <Link
                href="/rfq/new"
                className="hidden sm:inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-brand-blue/30 bg-blue-50/70 px-3 sm:px-3.5 text-xs font-semibold text-brand-blue hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-brand-blue" />
                <span>Post RFQ</span>
              </Link>

              <Link
                href="/login"
                className="h-9 sm:h-10 inline-flex items-center px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-ink hover:text-brand-blue transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/join"
                className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-blue-700 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-blue/20 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95"
              >
                Join now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
