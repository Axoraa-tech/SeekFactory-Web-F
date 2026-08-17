import type { BuyerProfile } from "@/entities/user";

export const SESSION_COOKIE = "sf-session";
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  id: string;
  name: string;
  role: "Buyer" | "Supplier";
  email: string;
  companyName: string;
};

export type JoinInput = {
  role: "Buyer" | "Supplier";
  email?: string;
  password?: string;
  phone?: string;
  companyName?: string;
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
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    companyName: payload.companyName,
    industry: payload.role === "Buyer" ? "Industrial sourcing" : "Manufacturing",
    country: payload.role === "Buyer" ? "India" : "China",
  };
}

export function readBrowserCookie(): SessionPayload | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${SESSION_COOKIE}=`));
  return parseSessionCookie(match?.slice(SESSION_COOKIE.length + 1));
}

export function writeBrowserCookie(payload: SessionPayload) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
}

export function clearBrowserCookie() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function displayRole(role: BuyerProfile["role"]) {
  return role === "Supplier" ? "Manufacturer" : "Buyer";
}

export function postAuthPath(role: BuyerProfile["role"], next?: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return role === "Supplier" ? "/factory" : "/";
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
