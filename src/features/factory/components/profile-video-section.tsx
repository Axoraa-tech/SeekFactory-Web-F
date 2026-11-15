"use client";

import { useRef, useState } from "react";
import { Loader2, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { getApi } from "@/shared/api";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function isAcceptedProfileVideo(file: Pick<File, "type" | "size">) {
  return VIDEO_TYPES.includes(file.type) && file.size > 0 && file.size <= MAX_VIDEO_BYTES;
}

type Props = {
  videoUrl?: string;
  /** Persists the new URL ("" removes it); rejects with a user-facing message on failure. */
  onSave: (profileVideoUrl: string) => Promise<void>;
};

/** One factory tour / chairman video on the factory profile, uploaded through the secure media endpoint. */
export function ProfileVideoSection({ videoUrl, onSave }: Props) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    if (!isAcceptedProfileVideo(file)) {
      setError(t("seller.profile.profileVideoInvalid"));
      return;
    }
    setBusy("upload");
    setError(null);
    setProgress(0);
    try {
      const uploaded = await getApi().factory.uploadMedia(file, "video", setProgress);
      await onSave(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("seller.profile.couldNotSaveProfilePlease"));
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy("remove");
    setError(null);
    try {
      await onSave("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("seller.profile.couldNotSaveProfilePlease"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-line bg-white p-5" aria-labelledby="profile-video-heading">
      <div className="flex items-center gap-2">
        <Video className="h-4 w-4 text-brand-blue" />
        <h3 id="profile-video-heading" className="text-sm font-bold text-neutral-900">
          {t("seller.profile.profileVideo")}
        </h3>
      </div>
      <p className="text-xs text-ink-muted">{t("seller.profile.profileVideoHint")}</p>
      {videoUrl && (
        <video
          key={videoUrl}
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          aria-label={t("seller.profile.profileVideo")}
          className="max-h-72 w-full rounded-lg bg-black"
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy !== null}
          className="sf-btn-add inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-bold text-brand-blue disabled:opacity-60"
        >
          {busy === "upload" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy === "upload"
            ? `${t("seller.profile.profileVideoUploading")} ${progress}%`
            : videoUrl
              ? t("seller.profile.replaceProfileVideo")
              : t("seller.profile.addProfileVideo")}
        </button>
        {videoUrl && (
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {t("seller.profile.removeProfileVideo")}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_TYPES.join(",")}
          onChange={pick}
          className="hidden"
          data-testid="profile-video-input"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
