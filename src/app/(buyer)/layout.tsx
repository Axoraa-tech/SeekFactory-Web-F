import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { loadBuyerShellData } from "@/features/shell/load-buyer-shell";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const shell = await loadBuyerShellData();

  return (
    <AppShell
      user={shell.user}
      categories={shell.categories}
      manufacturers={shell.manufacturers}
      products={shell.products}
      messages={shell.messages}
      messageCount={shell.messageCount}
      notificationCount={shell.notificationCount}
    >
      {children}
    </AppShell>
  );
}
