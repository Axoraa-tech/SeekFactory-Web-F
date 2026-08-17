import Link from "next/link";
import { Bell, ChevronDown, MessageCircle, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface shadow-nav">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="SeekFactory home">
          <BrandLogo priority className="h-11 w-auto max-w-[220px] object-contain object-left sm:h-12 sm:max-w-[260px]" />
        </Link>

        <form action="/explore" className="mx-auto hidden min-w-0 flex-1 max-w-2xl items-center md:flex">
          <div className="flex h-11 w-full overflow-hidden rounded-xl border border-line bg-canvas">
            <label className="sr-only" htmlFor="search-category">
              Category
            </label>
            <select
              id="search-category"
              name="category"
              defaultValue="all"
              className="w-[88px] shrink-0 border-r border-line bg-transparent px-3 text-sm text-ink"
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              name="q"
              placeholder="Search products, manufacturers, categories..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              className="m-1 flex h-9 w-11 items-center justify-center rounded-lg bg-brand-blue text-white"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/rfq/new"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Post RFQ</span>
              </Link>
              <Link
                href="/messages"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-canvas"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" />
                <Badge count={messageCount} />
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-canvas"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <Badge count={notificationCount} />
              </Link>
              <Link href="/profile" className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-canvas">
                <Avatar src={user.avatarUrl} alt={user.name} size={36} />
                <span className="hidden leading-tight lg:block">
                  <span className="block text-sm font-semibold">{user.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {user.role === "Supplier" ? "Manufacturer" : "Buyer"}
                  </span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-ink-faint lg:block" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden h-10 items-center px-3 text-sm font-semibold text-ink sm:inline-flex">
                Sign in
              </Link>
              <Link
                href="/join"
                className="inline-flex h-10 items-center rounded-full bg-brand-blue px-4 text-sm font-semibold text-white"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
