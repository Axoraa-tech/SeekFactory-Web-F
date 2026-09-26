import type { ReactNode } from "react";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightAside } from "@/components/layout/right-aside";
import { TopNav } from "@/components/layout/top-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { TimedAuthPrompt } from "@/features/auth/timed-auth-prompt";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Conversation } from "@/entities/message";
import type { Product } from "@/entities/product";
import type { BuyerProfile } from "@/entities/user";

type Props = {
  user: BuyerProfile | null;
  categories: Category[];
  allCategories?: Category[];
  manufacturers: Manufacturer[];
  products: Product[];
  messages: (Conversation & { manufacturer: Manufacturer })[];
  messageCount: number;
  notificationCount: number;
  children: ReactNode;
  showRight?: boolean;
};

export function AppShell({
  user,
  categories,
  allCategories,
  manufacturers,
  products,
  messages,
  messageCount,
  notificationCount,
  children,
  showRight = false,
}: Props) {
  return (
    <div className="min-h-screen bg-canvas pb-16 lg:pb-0">
      <TopNav
        user={user}
        categories={categories}
        allCategories={allCategories}
        messageCount={messageCount}
        notificationCount={notificationCount}
      />
      {/* data-app-shell: the single seek showcase hides the shell sidebars via CSS (see globals.css) */}
      <div data-app-shell className="mx-auto flex max-w-[1440px] gap-5 px-4 pt-3 pb-4 lg:px-6">
        <div data-shell-sidebar className="contents">
          <LeftSidebar
            categories={categories}
            manufacturers={manufacturers}
            products={products}
            messages={messages}
            messageCount={messageCount}
            notificationCount={notificationCount}
          />
        </div>
        <main className="min-w-0 flex-1">{children}</main>
        {showRight ? (
          <div data-shell-sidebar className="contents">
            <RightAside
              manufacturers={manufacturers}
              products={products}
              messages={messages}
              categories={categories}
            />
          </div>
        ) : null}
      </div>
      <MobileNav messageCount={messageCount} notificationCount={notificationCount} />
      <TimedAuthPrompt user={user} />
      <BackToTop />
    </div>
  );
}
