"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminApi } from "@/shared/api/admin-api";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await adminApi.logout();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      <LogOut size={16} />
      Log out
    </button>
  );
}
