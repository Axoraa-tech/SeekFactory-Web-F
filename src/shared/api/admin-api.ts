/**
 * Admin API client.
 *
 * All calls go through Next.js API route proxies at /api/admin/*
 * so there are ZERO cross-origin requests from the browser.
 * The Next.js server proxies to the Spring Boot backend server-to-server.
 */

import type { ShowcaseMode } from "@/features/feed/load-showcase";

export type AnalyticsPeriod = 7 | 30 | 90 | 365;

export interface LabelCount { label: string; count: number }

export interface AdminAnalytics {
  periodDays: number;
  bucket: "day" | "week" | "month";
  generatedAt: string;
  totals: {
    users: number; buyers: number; suppliers: number; admins: number; activeUsers: number;
    manufacturers: number; verifiedManufacturers: number; premiumManufacturers: number;
    products: number; activeProducts: number; reels: number; reelViews: number;
    rfqs: number; pendingRfqs: number; quotes: number; conversations: number; messages: number;
  };
  kpis: { key: string; current: number; previous: number }[];
  signups: { bucketStart: string; buyers: number; suppliers: number }[];
  rfqsOverTime: { bucketStart: string; count: number }[];
  rfqsByStatus: LabelCount[];
  usersByCountry: LabelCount[];
  topRfqCategories: LabelCount[];
  recentActivity: { type: string; title: string; subtitle?: string; occurredAt: string }[];
}

export interface AdminPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  counts: Record<string, number>;
}

export interface AdminUser {
  id: string; name: string; email?: string; phone?: string; role: "BUYER" | "SUPPLIER" | "ADMIN";
  authProvider?: string; companyName?: string; country?: string; active: boolean; totpEnabled: boolean;
  manufacturerId?: string; manufacturerName?: string; rfqCount: number; createdAt?: string;
}

export interface AdminManufacturer {
  id: string; slug: string; name: string; logoUrl?: string; country?: string; location?: string;
  verified: boolean; premium: boolean; planId?: string; planName?: string; ownerName?: string; ownerEmail?: string;
  productCount: number; reelCount: number; quoteCount: number; followerCount: number; createdAt?: string;
  verificationStatus?: VerificationStatus; submittedAt?: string;
}

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** The full application an admin reviews — everything the factory has supplied. */
export interface AdminManufacturerDetail {
  id: string; slug: string; name: string; logoUrl?: string; coverUrl?: string;
  verificationStatus?: VerificationStatus; verified: boolean; premium: boolean;
  reviewedBy?: string; reviewedAt?: string; rejectionReason?: string; submittedAt?: string;
  companyRegNumber?: string; taxId?: string; registrationDate?: string; factoryAddress?: string;
  certifications: string[];
  country?: string; location?: string; yearsEstablished?: number; factorySize?: string;
  employees?: string; description?: string; chairmanName?: string; websiteUrl?: string;
  exportCountries: string[]; categories: string[];
  ownerId?: string; ownerName?: string; ownerEmail?: string; ownerPhone?: string;
  ownerCountry?: string; ownerCompanyName?: string; ownerJoinedAt?: string;
  productCount: number; reelCount: number; quoteCount: number; followerCount: number;
  planId?: string; planName?: string; createdAt?: string;
}

export interface AdminRfq {
  id: string; referenceNumber: string; productName: string; quantity: string; unit?: string;
  targetPrice?: string; currency?: string; incoterm?: string; companyName?: string; details?: string;
  categoryName?: string; buyerName?: string; buyerEmail?: string; status: string; quoteCount: number; createdAt?: string;
}

export interface AdminPlan {
  id: string; name: string; priceUsd: number; featuresJson?: string; manufacturerCount: number; createdAt?: string;
}

export interface AdminShowcase {
  mode: ShowcaseMode;
  autoplay: boolean;
  showProfile: boolean;
  showPhotos: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export class AdminApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Calls the authenticated admin proxy (/api/admin/* -> backend /api/v1/admin/*). */
async function adminRequest<T>(path: string, init?: RequestInit & { query?: Record<string, string | number | undefined> }): Promise<T> {
  const params = new URLSearchParams();
  Object.entries(init?.query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  const res = await fetch(`/api/admin/${path}${qs ? `?${qs}` : ""}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new AdminApiError(data.message || `Request failed (${res.status})`, res.status);
  }
  return data.data as T;
}

type ListQuery = { q?: string; page?: number; size?: number };

export const adminData = {
  users: (query: ListQuery & { role?: string; status?: string }) =>
    adminRequest<AdminPage<AdminUser>>("users", { query }),
  setUserActive: (id: string, active: boolean) =>
    adminRequest<void>(`users/${id}/activate`, { method: "PUT", query: { active: String(active) } }),

  manufacturers: (query: ListQuery & { filter?: string }) =>
    adminRequest<AdminPage<AdminManufacturer>>("manufacturers", { query }),
  setVerified: (id: string, verified: boolean) =>
    adminRequest<void>(`manufacturers/${id}/verify`, { method: "PUT", query: { verified: String(verified) } }),
  manufacturer: (id: string) => adminRequest<AdminManufacturerDetail>(`manufacturers/${id}`),
  /** Approve, or reject with a reason the manufacturer will be shown. */
  reviewManufacturer: (id: string, approve: boolean, reason?: string) =>
    adminRequest<void>(`manufacturers/${id}/review`, {
      method: "PUT",
      query: { approve: String(approve), reason },
    }),
  setPlan: (id: string, planId?: string) =>
    adminRequest<void>(`manufacturers/${id}/plan`, { method: "PUT", query: { planId } }),

  rfqs: (query: ListQuery & { status?: string }) =>
    adminRequest<AdminPage<AdminRfq>>("rfqs", { query }),
  setRfqStatus: (id: string, status: string) =>
    adminRequest<void>(`rfqs/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  plans: () => adminRequest<AdminPlan[]>("pricing/plans"),
  createPlan: (plan: { name: string; priceUsd: number; features: string[] }) =>
    adminRequest<void>("pricing/plans", { method: "POST", body: JSON.stringify(plan) }),
  updatePlan: (id: string, plan: { name: string; priceUsd: number; features: string[] }) =>
    adminRequest<void>(`pricing/plans/${id}`, { method: "PUT", body: JSON.stringify(plan) }),
  deletePlan: (id: string) => adminRequest<void>(`pricing/plans/${id}`, { method: "DELETE" }),

  showcase: () => adminRequest<AdminShowcase>("settings/feed-showcase"),
  publishShowcase: (s: Pick<AdminShowcase, "mode" | "autoplay" | "showProfile" | "showPhotos">) =>
    adminRequest<AdminShowcase>("settings/feed-showcase", { method: "PUT", body: JSON.stringify(s) }),

  inviteAdmin: (email: string) =>
    adminRequest<{ token: string }>("auth/invite", { method: "POST", body: JSON.stringify({ email }) }),
};

export const adminApi = {
  /**
   * Set up admin password using an invite token.
   * Returns a QR code URI for TOTP setup on success.
   */
  async setupPassword(token: string, email: string, password: string) {
    const res = await fetch("/api/admin/setup-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to set up password");
    }

    return {
      qrCodeUri: data.data.qrCodeUri || data.data.qr_code_uri,
      secret: data.data.secret
    };
  },

  /**
   * Login as an admin using email, password, and TOTP.
   * Returns access token on success.
   */
  async login(email: string, password: string, totpCode: string) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code: totpCode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Invalid credentials");
    }

    // Tokens are held in the HttpOnly admin_token cookie and never returned to the browser
    return data.data;
  },

  /**
   * Log out the admin by clearing the admin_token cookie.
   */
  async logout() {
    await fetch("/api/admin/logout", { method: "POST" });
  },

  /**
   * Fetch live platform analytics for a rolling period (7, 30, 90 or 365 days).
   */
  async getAnalytics(days: AnalyticsPeriod): Promise<AdminAnalytics> {
    const res = await fetch(`/api/admin/dashboard/analytics?days=${days}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw Object.assign(new Error(data.message || "Failed to fetch analytics"), { status: res.status });
    }
    return data.data;
  },

  /**
   * Fetch admin dashboard statistics.
   */
  async getDashboardStats() {
    const res = await fetch("/api/admin/dashboard/stats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch dashboard stats");
    }

    return {
      totalUsers: data.data.total_users || data.data.totalUsers || 0,
      verifiedFactories: data.data.verified_factories || data.data.verifiedFactories || 0,
      pendingRfqs: data.data.pending_rfqs || data.data.pendingRfqs || 0
    };
  },
};
