"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Film, ImageIcon, Link2, Loader2, Package, Plus, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { getApi } from "@/shared/api";
import type { NewFactorySeek } from "@/shared/api/contracts";
import type { Category } from "@/entities/category";
import { cn } from "@/shared/lib/cn";

/** What the composer needs to know about a product it can link. */
export type LinkableProduct = { id: string; name: string; imageUrl?: string };

type Props = {
  author: { name: string; avatarUrl: string };
  products: LinkableProduct[];
  categories: Category[];
  onClose: () => void;
  /** Persists the seek; rejects with a user-facing message on failure. */
  onPublish: (seek: NewFactorySeek) => Promise<void>;
  /** Opens the product form; the composer links whatever product it creates. */
  onCreateProduct?: () => void;
  /** Set by the parent after onCreateProduct succeeds, so the new product is linked straight away. */
  newlyCreatedProductId?: string | null;
  /** Hidden (state kept) while the product form is open on top of it. */
  suspended?: boolean;
};

type Status = "idle" | "uploading-video" | "uploading-cover" | "saving";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const DRAFT_KEY = "sf-seek-draft";

type Draft = { title: string; description: string; categoryId: string; productIds: string[] };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage blocked: drafts are a convenience only
  }
}

/** Grabs a frame ~1s in as a JPEG, so a seek never needs a stock cover image. */
function captureFrame(src: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: Blob | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const timer = setTimeout(() => finish(null), 3000);
    const video = document.createElement("video");
    const cleanup = () => {
      clearTimeout(timer);
      video.onerror = null;
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.src = "";
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => finish(null);
    video.onloadedmetadata = () => {
      const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 2;
      video.currentTime = Math.min(1, dur / 2);
    };
    video.onseeked = () => {
      try {
        if (!video.videoWidth || !video.videoHeight) {
          finish(null);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0);
        canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.85);
      } catch {
        finish(null);
      }
    };
    video.src = src;
  });
}

/**
 * LinkedIn-style "Start a post" pop-up for video seeks: one video, a headline and caption,
 * a category and any number of linked products, published in a few clicks from the feed or
 * the Seller Hub. Full-screen sheet on phones.
 */
export function SeekComposerModal({
  author,
  products,
  categories,
  onClose,
  onPublish,
  onCreateProduct,
  newlyCreatedProductId,
  suspended = false,
}: Props) {
  const t = useTranslations();
  const roots = useMemo(() => categories.filter((c) => c.parentId === null), [categories]);
  const draft = useMemo(() => (typeof window === "undefined" ? null : readDraft()), []);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [categoryId, setCategoryId] = useState(draft?.categoryId ?? "");
  const [productIds, setProductIds] = useState<string[]>(draft?.productIds ?? []);
  const [video, setVideo] = useState<{ file: File; url: string; duration: number } | null>(null);
  const [cover, setCover] = useState<{ file: File; url: string } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<"video" | "title" | "category" | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Finished uploads survive a failed save, so retrying does not resend large files
  const uploadsRef = useRef(new Map<File, string>());
  const busy = status !== "idle";

  // Keep the text and links as a draft until the seek is published
  useEffect(() => {
    if (busy) return;
    const empty = !title && !description && !categoryId && productIds.length === 0;
    writeDraft(empty ? null : { title, description, categoryId, productIds });
  }, [title, description, categoryId, productIds, busy]);

  // A product created from inside the composer is linked automatically
  useEffect(() => {
    if (newlyCreatedProductId) {
      setProductIds((prev) => (prev.includes(newlyCreatedProductId) ? prev : [...prev, newlyCreatedProductId]));
    }
  }, [newlyCreatedProductId]);

  // Esc closes; the page behind does not scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy && !suspended) onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [busy, onClose, suspended]);

  // Free preview URLs when they change or the composer closes
  useEffect(() => () => {
    if (video) URL.revokeObjectURL(video.url);
  }, [video]);
  useEffect(() => () => {
    if (cover) URL.revokeObjectURL(cover.url);
  }, [cover]);

  const linked = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is LinkableProduct => Boolean(p));
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError(t("seller.seek.videoIsLargerThan100mb"));
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setVideo({ file, url, duration: Math.round(probe.duration) || 30 });
    };
    probe.onerror = () => setVideo({ file, url, duration: 30 });
    probe.src = url;
    setError(null);
    setInvalid(null);
  }

  function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("seller.seek.coverImageIsLargerThan"));
      return;
    }
    setCover({ file, url: URL.createObjectURL(file) });
    setError(null);
  }

  function toggleProduct(id: string) {
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function upload(file: File, kind: "image" | "video") {
    const cached = uploadsRef.current.get(file);
    if (cached) return cached;
    const media = await getApi().factory.uploadMedia(file, kind);
    uploadsRef.current.set(file, media.url);
    return media.url;
  }

  async function publish() {
    if (busy) return;
    if (!video) {
      setInvalid("video");
      setError(t("composer.errors.addVideo"));
      return;
    }
    if (!title.trim()) {
      setInvalid("title");
      setError(t("composer.errors.addTitle"));
      titleRef.current?.focus();
      return;
    }
    if (!categoryId) {
      setInvalid("category");
      setError(t("composer.errors.pickCategory"));
      return;
    }
    setInvalid(null);
    setError(null);

    try {
      setStatus("uploading-video");
      const videoUrl = await upload(video.file, "video");

      setStatus("uploading-cover");
      let coverFile = cover?.file ?? null;
      if (!coverFile) {
        const frame = await captureFrame(video.url);
        if (frame) coverFile = new File([frame], "cover.jpg", { type: "image/jpeg" });
      }
      let posterUrl = coverFile ? await upload(coverFile, "image") : linked[0]?.imageUrl ?? "";
      if (!posterUrl) {
        posterUrl = author.avatarUrl || "/placeholders/image.svg";
      }

      setStatus("saving");
      await onPublish({
        title: title.trim(),
        description: description.trim() || title.trim(),
        videoUrl,
        posterUrl,
        durationSec: video.duration,
        productIds,
        categoryIds: [categoryId],
      });
      writeDraft(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("seller.seek.couldNotPublishSeekPlease"));
      setStatus("idle");
    }
  }

  const statusLabel: Record<Exclude<Status, "idle">, string> = {
    "uploading-video": t("seller.seek.status.uploadingVideo"),
    "uploading-cover": t("seller.seek.status.uploadingCover"),
    saving: t("seller.seek.status.saving"),
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/60 sm:p-4",
        suspended && "hidden",
      )}
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("seller.composer.startAPost")}
        className="flex w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] flex-col bg-surface sm:rounded-2xl shadow-2xl outline-hidden"
      >
        {/* Header: who is posting */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 sm:px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={author.avatarUrl} alt={author.name} size={48} className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">{author.name}</p>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (invalid === "category") setInvalid(null);
                }}
                aria-label={t("composer.category")}
                className={cn(
                  "mt-1 max-w-[16rem] rounded-full border bg-canvas px-3 py-1 text-xs font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-brand-blue-soft",
                  invalid === "category" ? "border-red-400" : "border-line",
                )}
              >
                <option value="">{t("composer.chooseCategory")}</option>
                {roots.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("common.close")}
            className="rounded-full p-2 text-ink-muted transition hover:bg-canvas hover:text-ink disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 sm:px-6 py-4">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (invalid === "title") setInvalid(null);
            }}
            maxLength={120}
            placeholder={t("composer.titlePlaceholder")}
            className={cn(
              "w-full border-0 border-b bg-transparent pb-2 text-base sm:text-lg font-bold text-ink placeholder:text-ink-faint focus:outline-hidden",
              invalid === "title" ? "border-red-400" : "border-transparent focus:border-line",
            )}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("composer.captionPlaceholder")}
            className="w-full resize-none border-0 bg-transparent text-base sm:text-sm text-ink placeholder:text-ink-faint focus:outline-hidden"
          />

          {/* Video */}
          {video ? (
            <div className="relative overflow-hidden rounded-xl bg-black">
              <video src={video.url} controls playsInline className="max-h-[45vh] w-full object-contain" />
              {!busy && (
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  aria-label={t("composer.removeVideo")}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-canvas px-4 py-10 text-center transition hover:border-brand-blue",
                invalid === "video" ? "border-red-400" : "border-line",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-soft text-brand-blue">
                <Film className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold text-ink">{t("composer.addVideo")}</span>
              <span className="text-xs text-ink-muted">{t("composer.videoHint")}</span>
            </button>
          )}

          {/* Cover (optional) */}
          {video && (
            <div className="flex items-center gap-3">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="" className="h-12 w-20 rounded-md border border-line object-cover" />
              ) : null}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                {cover ? t("composer.changeCover") : t("composer.addCover")}
              </button>
              {!cover && <span className="text-[11px] text-ink-muted">{t("composer.coverAuto")}</span>}
            </div>
          )}

          {/* Linked products */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {linked.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-canvas py-1 pl-1 pr-2 text-xs font-semibold text-ink"
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-ink-muted" />
                  )}
                  <span className="truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    aria-label={t("composer.unlink", { name: p.name })}
                    className="text-ink-muted hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-blue/50 px-3 py-1 text-xs font-semibold text-brand-blue hover:bg-brand-blue-soft"
              >
                <Link2 className="h-3.5 w-3.5" />
                {t("composer.linkProduct")}
              </button>
            </div>

            {pickerOpen && (
              <div className="mt-2 rounded-xl border border-line bg-surface shadow-xs">
                <div className="relative border-b border-line p-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("composer.searchProducts")}
                    className="w-full rounded-lg bg-canvas py-2 pl-8 pr-3 text-base sm:text-sm text-ink focus:outline-hidden"
                  />
                </div>
                <ul className="max-h-56 overflow-y-auto py-1">
                  {filtered.map((p) => {
                    const on = productIds.includes(p.id);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-canvas"
                        >
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas">
                              <Package className="h-4 w-4 text-ink-muted" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate font-medium text-ink">{p.name}</span>
                          {on && <Check className="h-4 w-4 text-brand-blue" />}
                        </button>
                      </li>
                    );
                  })}
                  {filtered.length === 0 && (
                    <li className="px-3 py-3 text-center text-xs text-ink-muted">{t("composer.noProducts")}</li>
                  )}
                </ul>
                {onCreateProduct && (
                  <button
                    type="button"
                    onClick={onCreateProduct}
                    className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-sm font-semibold text-brand-blue hover:bg-canvas"
                  >
                    <Plus className="h-4 w-4" />
                    {t("composer.createProduct")}
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Footer: tools + post */}
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={busy}
              title={t("composer.addVideo")}
              aria-label={t("composer.addVideo")}
              className="rounded-full p-2 text-emerald-600 hover:bg-canvas disabled:opacity-50"
            >
              <Film className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={busy}
              title={t("composer.linkProduct")}
              aria-label={t("composer.linkProduct")}
              className="rounded-full p-2 text-brand-blue hover:bg-canvas disabled:opacity-50"
            >
              <Link2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {busy && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted" aria-live="polite">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {statusLabel[status as Exclude<Status, "idle">]}
              </span>
            )}
            <button
              type="button"
              onClick={() => void publish()}
              disabled={busy}
              className="rounded-full bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {t("composer.post")}
            </button>
          </div>
        </div>

        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={pickVideo} className="hidden" />
        <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={pickCover} className="hidden" />
      </div>
    </div>
  );
}
