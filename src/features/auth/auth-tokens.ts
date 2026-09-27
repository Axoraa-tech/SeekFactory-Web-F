/**
 * Backend JWT handling for the proxy and middleware (Edge-safe: no Node APIs).
 *
 * Both tokens live in HttpOnly cookies the browser cannot read. The access token is
 * short-lived; when it expires the refresh token is exchanged for a new pair.
 */
import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "sf-access-token";
export const REFRESH_COOKIE = "sf-refresh-token";

/** Matches the backend refresh-token lifetime (app.jwt.refresh-token-expiry). */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
/** Refresh slightly early so a token does not expire mid-request. */
const EXPIRY_SKEW_SECONDS = 60;

export const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080")
  .replace(/\/+$/, "")
  .replace("localhost", "127.0.0.1");

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

export function setTokenCookies(response: NextResponse, tokens: TokenPair) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expiresIn,
  });
  if (tokens.refreshToken) {
    response.cookies.set({
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
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
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
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
