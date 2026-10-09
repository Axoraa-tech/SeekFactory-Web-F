import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PORTAL_HEADER,
  clearTokenCookies,
  cookieNames,
  isExpired,
  portalForUrl,
  refreshTokens,
  resolveSessionPortal,
  setTokenCookies,
  type TokenPair,
} from "@/features/auth/auth-tokens";

/**
 * Edge middleware.
 *
 * Admin routes are gated here on the HttpOnly `admin_token` cookie. Buyer and
 * factory pages still authenticate per-page via `requireUser()`, because their
 * demo session cookie is client-writable and must not be treated as trusted.
 *
 * When real backend auth lands: verify HttpOnly session here and redirect guests
 * away from /messages, /notifications, /profile, /rfq/* before rendering.
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

  // Keep sign-in, admin, and API routes in their own auth context. On buyer pages, a
  // manufacturer can browse with the seller session when no buyer session is active.
  const requestedPortal = portalForUrl(pathname, request.nextUrl.searchParams);
  const isAuthEntry = pathname === "/login" || pathname === "/join";
  const canUseSellerSession =
    requestedPortal === "buyer" &&
    !isAuthEntry &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/");
  const buyerCookies = cookieNames("buyer");
  const sellerCookies = cookieNames("seller");
  const hasRequestedSession = Boolean(
    request.cookies.get(buyerCookies.access)?.value || request.cookies.get(buyerCookies.refresh)?.value,
  );
  const hasSellerSession = Boolean(
    request.cookies.get(sellerCookies.access)?.value || request.cookies.get(sellerCookies.refresh)?.value,
  );
  const portal = canUseSellerSession
    ? resolveSessionPortal(requestedPortal, hasRequestedSession, hasSellerSession)
    : requestedPortal;
  const names = cookieNames(portal);
  request.headers.set(PORTAL_HEADER, portal);

  let tokens: TokenPair | null = null;
  let sessionEnded = false;
  const refreshToken = request.cookies.get(names.refresh)?.value;
  if (refreshToken && isExpired(request.cookies.get(names.access)?.value)) {
    tokens = await refreshTokens(refreshToken);
    sessionEnded = !tokens;
    // Make the outcome visible to server components rendering this same request
    if (tokens) request.cookies.set(names.access, tokens.accessToken);
    else request.cookies.delete([names.access, names.refresh, names.session]);
  }

  const response = NextResponse.next({ request: { headers: request.headers } });
  if (tokens) {
    setTokenCookies(response, tokens, portal);
  } else if (sessionEnded) {
    clearTokenCookies(response, portal);
  }

  // SAMEORIGIN (not DENY) so the admin Seek Showcase page can preview the home page in an iframe;
  // other sites still cannot frame SeekFactory
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Modern equivalent of the above (X-Frame-Options is obsolete in CSP-aware browsers)
  response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Browsers only honour HSTS over HTTPS; production is always served over TLS
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: [
    // api/proxy is excluded: middleware buffers request bodies (10MB cap), which truncates
    // seek video uploads. The proxy returns the backend's own security headers.
    "/((?!_next/static|_next/image|favicon.ico|api/proxy/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
