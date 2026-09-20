import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { loadBuyerShellData } from "@/features/shell/load-buyer-shell";

export default async function FullViewLayout({ children }: { children: ReactNode }) {
  const shell = await loadBuyerShellData();

  return (
    <div className="min-h-screen bg-canvas pb-16 lg:pb-0">
      <TopNav
        user={shell.user}
        categories={shell.categories}
        messageCount={shell.messageCount}
        notificationCount={shell.notificationCount}
      />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-5">
        {children}
      </main>
      <MobileNav
        messageCount={shell.messageCount}
        notificationCount={shell.notificationCount}
      />
      <BackToTop />
    </div>
  );
}


