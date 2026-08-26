"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Edit3,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { BuyerProfile } from "@/entities/user";
import { getApi } from "@/shared/api";

type UserDropdownProps = {
  user: BuyerProfile;
  messageCount?: number;
  notificationCount?: number;
};

export function UserDropdown({
  user,
  messageCount = 0,
  notificationCount = 0,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await getApi().session.logout();
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const userEmail =
    (user as { email?: string }).email ||
    (user.role === "Supplier" ? "supplier@seekfactory.com" : "buyer@seekfactory.com");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${isOpen
          ? "border-brand-blue bg-blue-50/50 shadow-sm"
          : "border-transparent hover:border-line hover:bg-canvas"
          }`}
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size={36}
          className="ring-2 ring-brand-blue/20 transition-transform duration-200 group-hover:scale-105"
        />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-semibold text-ink group-hover:text-brand-blue transition-colors">
            {user.name}
          </span>
          <span className="block text-[11px] font-medium text-ink-muted">
            {user.role === "Supplier" ? "Manufacturer" : "Buyer"}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-faint transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-blue" : "group-hover:text-ink"
            }`}
        />
      </button>

      {/* Modern Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Header Profile Card */}
          <div className="mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-3 border border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} alt={user.name} size={44} className="ring-2 ring-white shadow-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink-muted">{userEmail}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold text-brand-blue">
                    <Sparkles className="h-3 w-3 text-brand-blue" />
                    {user.role === "Supplier" ? "Verified Supplier" : "Verified Buyer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="space-y-0.5 text-xs font-medium text-ink">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-canvas hover:text-brand-blue transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-ink-muted group-hover:text-brand-blue transition-colors" />
                <span>View Profile</span>
              </div>
              <span className="text-[10px] text-ink-faint group-hover:text-brand-blue">Public</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-canvas hover:text-brand-blue transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Edit3 className="h-4 w-4 text-ink-muted group-hover:text-brand-blue transition-colors" />
                <span>Edit Profile & Company</span>
              </div>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-ink-muted group-hover:bg-blue-100 group-hover:text-brand-blue">
                Edit
              </span>
            </Link>

            <Link
              href="/rfq/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-canvas hover:text-brand-blue transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-ink-muted group-hover:text-brand-blue transition-colors" />
                <span>My RFQs & Orders</span>
              </div>
            </Link>
          </div>

          <div className="my-1.5 h-px bg-slate-100" />

          {/* Account Settings & Sign out */}
          <div className="space-y-0.5 text-xs font-medium">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-ink hover:bg-canvas hover:text-brand-blue transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-ink-muted group-hover:text-brand-blue transition-colors" />
                <span>Account Settings</span>
              </div>
            </Link>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors group disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 text-red-500 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-semibold">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
