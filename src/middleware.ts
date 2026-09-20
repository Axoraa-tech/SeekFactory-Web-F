import { NextResponse } from "next/server";

/**
 * Middleware skeleton (mock-safe).
 *
 * Today: baseline security headers only. Auth remains per-page via `requireUser()`
 * because the demo session cookie is client-writable and must not be treated as trusted.
 *
 * When real backend auth lands: verify HttpOnly session here and redirect guests
 * away from /messages, /notifications, /profile, /rfq/* before rendering.
 */
export function middleware() {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
