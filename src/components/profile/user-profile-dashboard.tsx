"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  FileText,
  Bookmark,
  Crown,
  LogOut,
  Save,
  Check,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Zap,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatPriceInr } from "@/shared/lib/format";
import { getApi } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import type { BuyerProfile } from "@/entities/user";
import type { Product } from "@/entities/product";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  user: BuyerProfile;
  initialProducts?: Product[];
  initialManufacturers?: Manufacturer[];
};

export function UserProfileDashboard({
  user,
  initialProducts = [],
  initialManufacturers = [],
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "rfqs" | "saved" | "following" | "premium">("details");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name || "Global Sourcing Lead",
    email: (user as { email?: string }).email || "buyer@seekfactory.com",
    companyName: user.companyName || "Apex Industrial Solutions",
    industry: user.industry || "Precision Engineering & Machinery",
    country: user.country || "India",
    phone: "+91 98765 43210",
    taxId: "GSTIN29ABCDE1234F1Z5",
    address: "Plot 42, Peenya Industrial Area, Phase 2, Bengaluru, Karnataka 560058",
  });

  // Saved products state
  const [savedProducts, setSavedProducts] = useState<Product[]>(() => {
    return initialProducts.slice(0, 4);
  });

  // Followed manufacturers state
  const [followedSuppliers, setFollowedSuppliers] = useState<Manufacturer[]>(() => {
    return initialManufacturers.slice(0, 3);
  });

  // User tier state
  const [currentTier, setCurrentTier] = useState<"free" | "pro" | "enterprise">("pro");

  // RFQ mock list
  const [rfqs] = useState([
    {
      id: "SF-RFQ-9482",
      title: "5-Axis CNC Precision Aluminum Housings",
      category: "CNC Machining",
      targetQty: "500 Pieces",
      targetPrice: "₹1,450 / pc",
      status: "3 Factory Quotes Received",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      date: "Yesterday",
    },
    {
      id: "SF-RFQ-8910",
      title: "Closed Die Forged Automotive Drive Shafts",
      category: "Forging & Casting",
      targetQty: "250 Pieces",
      targetPrice: "₹2,800 / pc",
      status: "In Tooling & Sample Run",
      statusColor: "text-blue-700 bg-blue-50 border-blue-200",
      date: "3 days ago",
    },
    {
      id: "SF-RFQ-7241",
      title: "Multi-Cavity Precision Injection Tooling Mold",
      category: "Molds & Tooling",
      targetQty: "1 Set",
      targetPrice: "₹1,80,000 / set",
      status: "Open for Verified Bids",
      statusColor: "text-amber-700 bg-amber-50 border-amber-200",
      date: "1 week ago",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Company profile & contact preferences updated successfully!");
    }, 600);
  };

  const handleRemoveSaved = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast("Product removed from saved wishlist");
  };

  const handleToggleFollow = (mId: string) => {
    setFollowedSuppliers((prev) => prev.filter((m) => m.id !== mId));
    showToast("Manufacturer removed from following");
  };

  const handleUpgradeTier = (tier: "free" | "pro" | "enterprise") => {
    setCurrentTier(tier);
    showToast(`Membership successfully upgraded to ${tier.toUpperCase()} Tier!`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await getApi().session.logout();
      router.push("/");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Profile Header Hero */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                src={user.avatarUrl}
                alt={formData.name}
                size={72}
                className="ring-4 ring-white/10 shadow-lg object-cover"
              />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold truncate tracking-tight">
                  {formData.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                  <Sparkles className="h-3 w-3" />
                  {currentTier === "enterprise" ? "Enterprise VIP" : currentTier === "pro" ? "Pro Buyer Member" : "Standard Buyer"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 truncate">
                {formData.companyName} • {formData.industry}
              </p>
              <p className="text-[11px] text-slate-400">
                {formData.country} • Member since 2024 • Verified Trade Assurance Buyer
              </p>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("premium")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Membership Tier</span>
            </button>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-red-500/20 hover:border-red-400 px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5 text-red-400" />
              <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Badges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10 text-xs">
          <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Active RFQs</p>
            <p className="text-base font-extrabold text-white mt-0.5">{rfqs.length} Requests</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Saved Wishlist</p>
            <p className="text-base font-extrabold text-white mt-0.5">{savedProducts.length} Products</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Following Plants</p>
            <p className="text-base font-extrabold text-white mt-0.5">{followedSuppliers.length} Factories</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Escrow Protection</p>
            <p className="text-base font-extrabold text-emerald-400 mt-0.5">100% Active</p>
          </div>
        </div>
      </Card>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
            activeTab === "details"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Company & Contact Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rfqs")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
            activeTab === "rfqs"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>My RFQs & Orders</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
            {rfqs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
            activeTab === "saved"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Products</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
            {savedProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("following")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
            activeTab === "following"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <User className="h-4 w-4" />
          <span>Following Factories</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
            {followedSuppliers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("premium")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
            activeTab === "premium"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          <Crown className="h-4 w-4 text-amber-500" />
          <span>Membership & Plans</span>
        </button>
      </div>

      {/* 3. TAB 1: EDITABLE COMPANY & PROFILE DETAILS */}
      {activeTab === "details" && (
        <Card className="p-6 border-slate-200/90 shadow-2xs">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Corporate & Contact Information</h2>
            <p className="text-xs text-slate-500">
              Manage your company sourcing credentials, tax registration, and primary delivery dispatch address.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Contact Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry & Sourcing Sector
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp (For Factory RFQ Alerts)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax ID / GSTIN / Business Reg Number
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Shipping / Plant Delivery Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue leading-relaxed"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving Updates..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. TAB 2: MY RFQS & ORDERS */}
      {activeTab === "rfqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Buying Requests & RFQs</h2>
              <p className="text-xs text-slate-500">Track quotes and sample runs from verified manufacturers</p>
            </div>

            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post New RFQ</span>
            </Link>
          </div>

          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <Card key={rfq.id} className="p-4 sm:p-5 border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{rfq.id}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", rfq.statusColor)}>
                      {rfq.status}
                    </span>
                    <span className="text-[11px] text-slate-400">• Posted {rfq.date}</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {rfq.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>Category: <strong>{rfq.category}</strong></span>
                    <span>•</span>
                    <span>Target: <strong>{rfq.targetQty}</strong></span>
                    <span>•</span>
                    <span>Est. Price: <strong className="text-rose-600">{rfq.targetPrice}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/messages?rfq=${rfq.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors shadow-2xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-brand-blue" />
                    <span>View Bids</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: SAVED PRODUCTS */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Machines & Industrial Parts</h2>
              <p className="text-xs text-slate-500">Quickly re-order or initiate instant checkout from your bookmarked items</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{savedProducts.length} items</span>
          </div>

          {savedProducts.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 space-y-2">
              <Bookmark className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-700">No saved products yet</p>
              <p className="text-xs text-slate-500">Explore machinery and click the bookmark button to save items here.</p>
              <Link href="/explore" className="inline-block mt-2 rounded-xl bg-brand-blue px-4 py-1.5 text-xs font-bold text-white">
                Explore Catalog
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedProducts.map((p) => (
                <Card key={p.id} className="p-4 border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          {formatPriceInr(p.priceInr)}
                        </span>
                        <span className="text-[11px] text-slate-400">/{p.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSaved(p.id, e)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/products/${p.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        <span>Order</span>
                      </Link>
                      <Link
                        href={`/products/${p.slug}?action=checkout`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                      >
                        <Zap className="h-3 w-3 fill-white/80" />
                        <span>Buy Now</span>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 4: FOLLOWING FACTORIES */}
      {activeTab === "following" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Partner Facilities</h2>
              <p className="text-xs text-slate-500">Direct connections with audited OEM & ODM manufacturing plants</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{followedSuppliers.length} following</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {followedSuppliers.map((m) => (
              <Card key={m.id} className="p-4 border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.logoUrl}
                    alt={m.name}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{m.name}</p>
                      {m.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{m.location}, {m.country}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Est. {m.yearsEstablished} • {m.factorySize}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(m.id)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Unfollow
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/messages?with=${m.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-blue hover:bg-blue-50 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat</span>
                    </Link>
                    <Link
                      href={`/manufacturers/${m.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-black transition-colors"
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: MEMBERSHIP & PLANS */}
      {activeTab === "premium" && (
        <div className="space-y-5">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Choose Your Sourcing Tier</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Upgrade to unlock priority RFQ dispatch, live video audits, and dedicated enterprise engineering support.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Free Tier */}
            <Card className={cn(
              "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-2xs",
              currentTier === "free" ? "border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/20" : "border-slate-200/90 bg-white"
            )}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Standard Buyer</h3>
                  {currentTier === "free" && (
                    <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-500"> / forever</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Browse 500+ Verified Plants</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Up to 5 Active RFQs / Month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Standard Trade Assurance Escrow</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={currentTier === "free"}
                onClick={() => handleUpgradeTier("free")}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {currentTier === "free" ? "Current Plan" : "Switch to Free"}
              </button>
            </Card>

            {/* Pro Tier (Popular) */}
            <Card className={cn(
              "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-md relative",
              currentTier === "pro" ? "border-brand-blue ring-2 ring-brand-blue/30 bg-blue-50/30" : "border-slate-300 bg-white"
            )}>
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
                Most Popular
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Pro Sourcing Lead</h3>
                  {currentTier === "pro" && (
                    <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">₹3,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> <strong>Unlimited</strong> Custom RFQs & Quotes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Priority RFQ Dispatch (&lt; 4h quotes)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Verified Buyer Gold Badge</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Dedicated Account Manager</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={currentTier === "pro"}
                onClick={() => handleUpgradeTier("pro")}
                className="w-full h-10 rounded-xl bg-brand-blue text-xs font-bold text-white hover:bg-brand-blue-dark shadow-sm active:scale-95 disabled:opacity-60 transition-all"
              >
                {currentTier === "pro" ? "Current Plan Active" : "Upgrade to Pro"}
              </button>
            </Card>

            {/* Enterprise Tier */}
            <Card className={cn(
              "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-2xs",
              currentTier === "enterprise" ? "border-brand-blue ring-2 ring-brand-blue/30 bg-blue-50/20" : "border-slate-200/90 bg-white"
            )}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Enterprise VIP</h3>
                  {currentTier === "enterprise" && (
                    <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">₹11,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> All Pro Buyer Features Included</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Third-Party On-Site Plant Inspection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Custom Escrow Milestone Contracts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> 24/7 Priority Sourcing Hotline</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={currentTier === "enterprise"}
                onClick={() => handleUpgradeTier("enterprise")}
                className="w-full h-9 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-black active:scale-95 disabled:opacity-60 transition-all shadow-xs"
              >
                {currentTier === "enterprise" ? "Current Plan Active" : "Upgrade to Enterprise"}
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
