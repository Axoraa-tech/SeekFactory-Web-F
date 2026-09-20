/**
 * Admin API client.
 *
 * All calls go through Next.js API route proxies at /api/admin/*
 * so there are ZERO cross-origin requests from the browser.
 * The Next.js server proxies to the Spring Boot backend server-to-server.
 */

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
      qrCodeUri: data.data.qr_code_uri,
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

    return {
      accessToken: data.data.access_token || data.data.accessToken,
      refreshToken: data.data.refresh_token || data.data.refreshToken,
      ...data.data
    };
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
