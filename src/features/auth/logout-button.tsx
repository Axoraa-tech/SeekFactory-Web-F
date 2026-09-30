"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApi } from "@/shared/api";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations();
  const router = useRouter();
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
          router.push("/");
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