"use client";

import { useRouter } from "next/navigation";
import { getApi } from "@/shared/api";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="mt-4 text-sm font-semibold text-brand-blue"
      onClick={async () => {
        await getApi().session.logout();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
