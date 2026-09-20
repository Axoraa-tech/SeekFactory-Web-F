import type { ApiClient } from "@/shared/api/contracts";
import { mockApi } from "@/shared/mocks/mock-api";

/**
 * Single seam for swapping mocks → HTTP.
 * Replace `mockApi` with `createHttpApi(process.env.NEXT_PUBLIC_API_URL)` later.
 */
export function getApi(): ApiClient {
  return mockApi;
}

export type { ApiClient } from "@/shared/api/contracts";
