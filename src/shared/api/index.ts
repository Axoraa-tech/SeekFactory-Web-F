import type { ApiClient } from "@/shared/api/contracts";
import { createHttpApi } from "@/shared/api/http-api";
import { cache } from "react";

/**
 * Global API client: always the Spring Boot backend at NEXT_PUBLIC_API_URL
 * (e.g. http://localhost:8080 or https://api.seekfactory.com). There is no mock fallback;
 * all catalog data comes from the database.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:8080";

/**
 * Server only: one client per incoming request (React cache() is scoped to a single server render),
 * so the layout and the page share in-flight GETs instead of calling the backend twice.
 * Never shared across requests or users.
 */
const getRequestScopedHttpApi = cache((url: string) => createHttpApi(url, { dedupeServerGets: true }));

export function getApi(): ApiClient {
  return typeof window === "undefined" ? getRequestScopedHttpApi(apiUrl) : createHttpApi(apiUrl);
}
