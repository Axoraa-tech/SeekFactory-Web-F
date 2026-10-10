import type { ApiClient } from "@/shared/api/contracts";
import { mockApi } from "@/shared/mocks/mock-api";
import { createHttpApi } from "@/shared/api/http-api";
import { cache } from "react";

const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

/**
 * Global API Factory Seam:
 * - If NEXT_PUBLIC_API_URL is defined (e.g. http://localhost:8080 or https://api.seekfactory.com),
 *   it returns the real createHttpApi() talking to the Spring Boot backend.
 * - If NEXT_PUBLIC_API_URL is empty, it safely falls back to mockApi (perfect for zero-backend UI preview).
 */
/**
 * Server only: one client per incoming request (React cache() is scoped to a single server render),
 * so the layout and the page share in-flight GETs instead of calling the backend twice.
 * Never shared across requests or users.
 */
const getRequestScopedHttpApi = cache((url: string) => createHttpApi(url, { dedupeServerGets: true }));

export function getApi(): ApiClient {
  if (rawUrl && rawUrl.length > 0) {
    return typeof window === "undefined" ? getRequestScopedHttpApi(rawUrl) : createHttpApi(rawUrl);
  }
  return mockApi;
}

