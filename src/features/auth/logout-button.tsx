"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApi } from "@/shared/api";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <button
      type="button"
      disabled={loggingOut}
      aria-label="Sign out"
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
      {loggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}