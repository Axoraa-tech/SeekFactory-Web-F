import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { loadBuyerShellData } from "@/features/shell/load-buyer-shell";
import { SellerPreviewBar } from "@/features/factory/seller-preview-bar";

export default async function FullViewLayout({ children }: { children: ReactNode }) {
  const shell = await loadBuyerShellData();
  // Manufacturers reach these pages from the Seller Hub's "View" buttons; keep them out of the buyer chrome
  const isSupplier = shell.user?.role === "Supplier";

  return (
    <div className={isSupplier ? "min-h-screen bg-canvas" : "min-h-screen bg-canvas pb-16 lg:pb-0"}>
      {isSupplier ? (
        <SellerPreviewBar />
      ) : (
        <TopNav
          user={shell.user}
          categories={shell.categories}
          messageCount={shell.messageCount}
          notificationCount={shell.notificationCount}
        />
      )}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-5">
        {children}
      </main>
      {!isSupplier && (
        <MobileNav
          messageCount={shell.messageCount}
          notificationCount={shell.notificationCount}
        />
      )}
      <BackToTop />
    </div>
  );
}


