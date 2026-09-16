import type { ReactNode } from "react";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightAside } from "@/components/layout/right-aside";
import { TopNav } from "@/components/layout/top-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { TimedAuthPrompt } from "@/features/auth/timed-auth-prompt";
import { DynamicCategoryNav } from "@/features/explore/dynamic-category-nav";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Conversation } from "@/entities/message";
import type { Product } from "@/entities/product";
import type { BuyerProfile } from "@/entities/user";

type Props = {
  user: BuyerProfile | null;
  categories: Category[];
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
        messageCount={messageCount}
        notificationCount={notificationCount}
      />
      {categories && categories.length > 0 ? (
        <div className="mx-auto max-w-[1440px] px-4 pt-1.5 lg:px-6">
          <DynamicCategoryNav categories={categories} forYouHref="/" sticky={false} />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[1440px] gap-5 px-4 pt-3 pb-4 lg:px-6">
        <LeftSidebar
          categories={categories}
          manufacturers={manufacturers}
          products={products}
          messages={messages}
          messageCount={messageCount}
          notificationCount={notificationCount}
        />
        <main className="min-w-0 flex-1">{children}</main>
        {showRight ? (
          <RightAside
            manufacturers={manufacturers}
            products={products}
            messages={messages}
            categories={categories}
          />
        ) : null}
      </div>
      <MobileNav messageCount={messageCount} notificationCount={notificationCount} />
      <TimedAuthPrompt user={user} />
      <BackToTop />
    </div>
  );
}

