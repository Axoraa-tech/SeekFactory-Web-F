import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearTokenCookies,
  isExpired,
  refreshTokens,
  setTokenCookies,
  type TokenPair,
} from "@/features/auth/auth-tokens";
import { SESSION_COOKIE } from "@/features/auth/session-cookie";

/**
 * Security headers, admin gate, and backend session refresh.
 *
 * Server components call the backend with the HttpOnly access-token cookie. When it has expired
 * but the refresh token is still valid, a new pair is fetched here, before rendering, so the page
 * sees the signed-in user. Per-page auth stays in `requireUser()`.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin routes. The design preview is exempt only in development; the
  // page itself 404s in a production build, so it can never be reached live.
  const isDevPreview = process.env.NODE_ENV !== "production" && pathname.startsWith("/admin/preview");

  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/setup") &&
    !isDevPreview
  ) {
    const adminToken = request.cookies.get("admin_token");
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  let tokens: TokenPair | null = null;
  let sessionEnded = false;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken && isExpired(request.cookies.get(ACCESS_COOKIE)?.value)) {
    tokens = await refreshTokens(refreshToken);
    sessionEnded = !tokens;
    // Make the outcome visible to server components rendering this same request
    if (tokens) request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
    else request.cookies.delete([ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]);
  }

  const response = NextResponse.next({ request: { headers: request.headers } });
  if (tokens) {
    setTokenCookies(response, tokens);
  } else if (sessionEnded) {
    clearTokenCookies(response);
    response.cookies.delete(SESSION_COOKIE);
  }

  // SAMEORIGIN (not DENY) so the admin Seek Showcase page can preview the home page in an iframe;
  // other sites still cannot frame SeekFactory
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    // api/proxy is excluded: middleware buffers request bodies (10MB cap), which truncates
    // seek video uploads. The proxy returns the backend's own security headers.
    "/((?!_next/static|_next/image|favicon.ico|api/proxy/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
