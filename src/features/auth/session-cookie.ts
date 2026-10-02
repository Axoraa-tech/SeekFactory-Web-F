import type { BuyerProfile } from "@/entities/user";
import { cookieNames, portalForUrl, type Portal } from "@/features/auth/auth-tokens";

export const SESSION_COOKIE = "sf-session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  id: string;
  name: string;
  role: "Buyer" | "Supplier";
  email: string;
  companyName: string;
};

export type JoinInput = {
  role: "Buyer" | "Supplier";
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  country?: string;
  /** Verification code typed by the user for phone sign-in. */
  otp?: string;
  method: "email" | "phone";
};

export type LoginInput = JoinInput;

export function parseSessionCookie(raw: string | undefined): SessionPayload | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as SessionPayload;
    if (!value?.id || !value.role) return null;
    return value;
  } catch {
    return null;
  }
}

export function payloadToProfile(payload: SessionPayload): BuyerProfile {
  return {
    id: payload.id,
    name: payload.name,
    role: payload.role,
    avatarUrl: "",
    companyName: payload.companyName,
    industry: payload.role === "Buyer" ? "Industrial sourcing" : "Manufacturing",
    country: payload.role === "Buyer" ? "India" : "China",
    email: payload.email,
  };
}

/** Display-only session of one section (buyer site or seller hub); mock mode uses the buyer one. */
export function readBrowserCookie(portal: Portal = "buyer"): SessionPayload | null {
  if (typeof document === "undefined") return null;
  const name = cookieNames(portal).session;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return parseSessionCookie(match?.slice(name.length + 1));
}

export function writeBrowserCookie(payload: SessionPayload, portal: Portal = "buyer") {
  document.cookie = `${cookieNames(portal).session}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
}

export function clearBrowserCookie(portal: Portal = "buyer") {
  document.cookie = `${cookieNames(portal).session}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function displayRole(role: BuyerProfile["role"]) {
  return role === "Supplier" ? "Manufacturer" : "Buyer";
}

/**
 * Where to go after signing in, by the section signed in to (the tab chosen on the sign-in page,
 * not the account's role: a manufacturer may sign in to the buyer site too).
 * A same-origin `next` in that same section wins; otherwise a supplier's first sign-in opens the
 * product catalog (client request), later ones the seller dashboard.
 */
export function postAuthPath(signedInAs: BuyerProfile["role"], next?: string, firstLogin = false) {
  const portal: Portal = signedInAs === "Supplier" ? "seller" : "buyer";
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    const target = new URL(next, "http://local");
    if (portalForUrl(target.pathname, target.searchParams) === portal) return next;
  }
  if (portal === "buyer") return "/";
  return firstLogin ? "/factory?tab=products" : "/factory";
}

export function buildPayload(input: JoinInput): SessionPayload {
  const email = input.email?.trim() || `${input.phone ?? "user"}@seekfactory.com`;
  const companyName =
    input.companyName?.trim() ||
    (input.role === "Supplier" ? "New Factory" : "New Buyer Company");
  const nameFromEmail = email.split("@")[0]?.replace(/[._]/g, " ") || "Member";
  return {
    id: `user-${Date.now()}`,
    name: nameFromEmail.replace(/\b\w/g, (char) => char.toUpperCase()),
    role: input.role,
    email,
    companyName,
  };
}
