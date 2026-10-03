/**
 * Backend JWT handling for the proxy and middleware (Edge-safe: no Node APIs).
 *
 * Both tokens live in HttpOnly cookies the browser cannot read. The access token is
 * short-lived; when it expires the refresh token is exchanged for a new pair.
 */
import type { NextResponse } from "next/server";
import { BACKEND_API_URL, BACKEND_ORIGIN } from "@/features/auth/backend-url";

/**
 * The buyer site and the seller hub (/factory) keep separate sessions, so a manufacturer signed in
 * to the seller hub is a guest on the buyer site until they sign in there too (and vice versa).
 */
export type Portal = "buyer" | "seller";

/** Set by the browser (proxy calls) and by the middleware (server rendering) to pick the session. */
export const PORTAL_HEADER = "x-sf-portal";

const COOKIE_NAMES: Record<Portal, { access: string; refresh: string; session: string }> = {
  buyer: { access: "sf-access-token", refresh: "sf-refresh-token", session: "sf-session" },
  seller: { access: "sf-seller-access-token", refresh: "sf-seller-refresh-token", session: "sf-seller-session" },
};

export const ACCESS_COOKIE = COOKIE_NAMES.buyer.access;
export const REFRESH_COOKIE = COOKIE_NAMES.buyer.refresh;

export function cookieNames(portal: Portal) {
  return COOKIE_NAMES[portal];
}

export function parsePortal(value: string | null | undefined): Portal | null {
  return value === "seller" || value === "buyer" ? value : null;
}

/**
 * Which session a page uses: the seller hub, and the sign-in/join pages opened for manufacturers,
 * use the seller session; everything else is the buyer site.
 */
export function portalForUrl(pathname: string, searchParams?: URLSearchParams): Portal {
  if (pathname === "/factory" || pathname.startsWith("/factory/")) return "seller";
  if ((pathname === "/login" || pathname === "/join") && searchParams?.get("role") === "manufacturer") return "seller";
  return "buyer";
}

/** Matches the backend refresh-token lifetime (app.jwt.refresh-token-expiry). */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
/** Refresh slightly early so a token does not expire mid-request. */
const EXPIRY_SKEW_SECONDS = 60;

/** Backend origin without the API prefix; the proxy appends the full `/api/v1/...` path itself. */
export const BACKEND_URL = BACKEND_ORIGIN;

export type TokenPair = { accessToken: string; refreshToken?: string; expiresIn?: number };

/** Reads the token pair from an auth endpoint's { data: { accessToken, refreshToken, expiresIn } } body. */
export function readTokenPair(body: unknown): TokenPair | null {
  const data = (body as { data?: Record<string, unknown> } | null)?.data;
  const accessToken = data?.accessToken ?? data?.access_token;
  if (typeof accessToken !== "string" || !accessToken) return null;
  const refreshToken = data?.refreshToken ?? data?.refresh_token;
  const expiresIn = data?.expiresIn ?? data?.expires_in;
  return {
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
  };
}

export function setTokenCookies(response: NextResponse, tokens: TokenPair, portal: Portal = "buyer") {
  const secure = process.env.NODE_ENV === "production";
  const names = COOKIE_NAMES[portal];
  response.cookies.set({
    name: names.access,
    value: tokens.accessToken,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expiresIn,
  });
  if (tokens.refreshToken) {
    response.cookies.set({
      name: names.refresh,
      value: tokens.refreshToken,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

/** Signs one section out; the other section's session is untouched. */
export function clearTokenCookies(response: NextResponse, portal: Portal = "buyer") {
  const names = COOKIE_NAMES[portal];
  response.cookies.delete(names.access);
  response.cookies.delete(names.refresh);
  response.cookies.delete(names.session);
}

/** True when the JWT is missing, unreadable or about to expire. Signature is not checked here; the backend does that. */
export function isExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return !json.exp || json.exp - EXPIRY_SKEW_SECONDS <= Date.now() / 1000;
  } catch {
    return true;
  }
}

/** Exchanges a refresh token for a new pair; null when the session is over. */
export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return readTokenPair(await res.json());
  } catch {
    return null;
  }
}
