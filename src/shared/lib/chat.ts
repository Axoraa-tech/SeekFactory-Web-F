import type { MessageAttachment } from "@/shared/api/contracts";

/** Accept list for chat uploads (must match the backend allowlist). */
export const CHAT_ATTACHMENT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,application/pdf";
export const CHAT_ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;

/**
 * Chat attachments are private to the conversation's participants, so they are fetched
 * through the same-origin proxy (which attaches the HttpOnly session), never directly.
 */
export function attachmentHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/api/v1/")) return `/api/proxy${url}`;
  return url;
}

export function isImageAttachment(attachment: MessageAttachment): boolean {
  if (attachment.contentType) return attachment.contentType.startsWith("image/");
  return /\.(png|jpe?g|webp|gif)$/i.test(attachment.name);
}

export function isPdfAttachment(attachment: MessageAttachment): boolean {
  if (attachment.contentType) return attachment.contentType === "application/pdf";
  return /\.pdf$/i.test(attachment.name);
}

/** "10:42 AM" for today, "27 Sep, 10:42 AM" otherwise; non-date strings pass through. */
export function formatChatTime(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  return sameDay ? time : `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}
