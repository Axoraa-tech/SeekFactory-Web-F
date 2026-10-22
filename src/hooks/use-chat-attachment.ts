"use client";

import { useCallback, useEffect, useState } from "react";
import { getApi } from "@/shared/api";
import type { MessageAttachment } from "@/shared/api/contracts";
import { CHAT_ATTACHMENT_ACCEPT, CHAT_ATTACHMENT_MAX_BYTES } from "@/shared/lib/chat";
import { useTranslations } from "next-intl";

const ALLOWED = new Set(CHAT_ATTACHMENT_ACCEPT.split(","));

/**
 * Picks and uploads one chat attachment (image or PDF) for a conversation.
 * The uploaded attachment is then passed to messages.sendMessage().
 * `previewUrl` is a local object URL of a picked photo, shown while it uploads and until it is sent.
 */
export function useChatAttachment(conversationId: string | undefined) {
  const t = useTranslations();
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs hold the file in memory until revoked
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const pick = useCallback(
    async (file: File | undefined) => {
      if (!file || !conversationId) return;
      setError(null);
      if (!ALLOWED.has(file.type)) {
        setError(t("chat.attach.onlyImagesPngJpgWebp"));
        return;
      }
      if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
        setError(t("chat.attach.fileIsLargerThan20"));
        return;
      }
      setAttachment(null);
      setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
      setUploading(true);
      try {
        setAttachment(await getApi().messages.uploadAttachment(conversationId, file));
      } catch (err) {
        setPreviewUrl(null);
        setError(err instanceof Error ? err.message : t("chat.attach.uploadFailedPleaseRetry"));
      } finally {
        setUploading(false);
      }
    },
    [conversationId, t],
  );

  const clear = useCallback(() => {
    setAttachment(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  return { attachment, previewUrl, uploading, error, pick, clear };
}
