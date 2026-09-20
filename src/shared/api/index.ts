import type { ApiClient } from "@/shared/api/contracts";
import { mockApi } from "@/shared/mocks/mock-api";
import { createHttpApi } from "@/shared/api/http-api";

const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

/**
 * Global API Factory Seam:
 * - If NEXT_PUBLIC_API_URL is defined (e.g. http://localhost:8080 or https://api.seekfactory.com),
 *   it returns the real createHttpApi() talking to the Spring Boot backend.
 * - If NEXT_PUBLIC_API_URL is empty, it safely falls back to mockApi (perfect for zero-backend UI preview).
 */
export function getApi(): ApiClient {
  if (rawUrl && rawUrl.length > 0) {
    return createHttpApi(rawUrl);
  }
  return mockApi;
}

export type { ApiClient } from "@/shared/api/contracts";