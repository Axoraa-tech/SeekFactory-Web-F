/**
 * Where the Spring backend lives, resolved once for every server-side caller
 * (proxy, admin routes, token refresh). Pure string handling so it is Edge-safe.
 *
 * BACKEND_URL may be set as the bare origin (https://api.example.com) or with the API
 * prefix (https://api.example.com/api/v1). Both normalise to the same origin, so one
 * environment variable works for every route.
 */
export function normaliseBackendOrigin(raw: string | undefined): string {
  return (raw ?? "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/i, "")
    .replace(/\/+$/, "")
    .replace("localhost", "127.0.0.1");
}

export const BACKEND_ORIGIN =
  normaliseBackendOrigin(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL) || "http://127.0.0.1:8080";

/** Base for the versioned API: `${BACKEND_API_URL}/admin/auth/login`. */
export const BACKEND_API_URL = `${BACKEND_ORIGIN}/api/v1`;
