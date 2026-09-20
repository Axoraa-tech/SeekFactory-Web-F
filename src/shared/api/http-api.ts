import type { ApiClient } from "@/shared/api/contracts";

/**
 * Future HTTP adapter. UI should keep using getApi() only.
 * When backend exists, implement fetch JSON here and return from getApi().
 */
export function createHttpApi(baseUrl: string): ApiClient {
  throw new Error(
    `HttpApi is not wired yet (${baseUrl}). Use mockApi via getApi().`,
  );
}
