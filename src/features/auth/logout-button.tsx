"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getApi } from "@/shared/api";
import { resetFollowStore } from "@/features/engagement/follow-store";
import { resetUnreadCounts } from "@/features/inbox/unread-store";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <button
      type="button"
      disabled={loggingOut}
      aria-label={t("userMenu.signOut")}
      className="mt-4 text-sm font-semibold text-brand-blue disabled:opacity-60 disabled:cursor-not-allowed"
      onClick={async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
          await getApi().session.logout();
          resetFollowStore();
          resetUnreadCounts();
          // Signing out of the seller hub leaves the buyer site session alone; go back to its sign-in
          router.push(pathname.startsWith("/factory") ? "/login?role=manufacturer" : "/");
          router.refresh();
        } catch {
          setLoggingOut(false);
        }
      }}
    >
      {loggingOut ? t("userMenu.signingOut") : t("userMenu.signOut")}
    </button>
  );
}