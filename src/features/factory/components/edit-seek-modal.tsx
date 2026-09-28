"use client";

import { useRef, useState } from "react";
import { X, Pencil, Loader2, Save, Image as ImageIcon, Check } from "lucide-react";
import { getApi } from "@/shared/api";
import type { FactorySeekUpdate } from "@/shared/api/contracts";
import type { SellerProduct, SellerSeek } from "../types";

type Props = {
  seek: SellerSeek;
  products: SellerProduct[];
  onClose: () => void;
  /** Persists the edit; rejects with a user-facing message on failure. */
  onSave: (id: string, update: FactorySeekUpdate) => Promise<void>;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

/** Edits a published seek's details. The video itself stays; upload a new seek to replace footage. */
export function EditSeekModal({ seek, products, onClose, onSave }: Props) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(seek.title);
  const [description, setDescription] = useState(seek.description);
  const [hashtags, setHashtags] = useState(seek.hashtags.join(" "));
  const [productIds, setProductIds] = useState<string[]>(seek.productIds);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = status !== "idle";

  function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Cover image is larger than 20MB.");
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function toggleProduct(id: string) {
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setError(null);
    try {
      let posterUrl: string | undefined;
      if (coverFile) {
        setStatus("uploading");
        posterUrl = (await getApi().factory.uploadMedia(coverFile, "image")).url;
      }
      setStatus("saving");
      await onSave(seek.id, {
        title: title.trim(),
        description: description.trim(),
        hashtags: hashtags
          .split(/[\s,]+/)
          .map((tag) => tag.trim())
          .filter(Boolean)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
        productIds,
        posterUrl,
      });
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes. Please retry.");
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface shadow-2xl border border-line">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Edit Video Seek</h2>
              <p className="text-xs text-ink-muted">Update the title, caption, cover and tagged products</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Caption</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#cnc #machining #oem"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">Cover Image</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview || seek.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-bold text-ink hover:border-brand-blue hover:text-brand-blue transition"
              >
                <ImageIcon className="h-4 w-4" />
                {coverFile ? "Choose another" : "Replace cover"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickCover}
                className="hidden"
              />
            </div>
          </div>

          {products.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Tagged Products (shown under &quot;View Products&quot;)
              </label>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                {products.map((product) => {
                  const checked = productIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      aria-pressed={checked}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                        checked ? "bg-brand-blue-soft text-brand-blue" : "hover:bg-canvas text-ink"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? "border-brand-blue bg-brand-blue text-white" : "border-neutral-300"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="truncate font-semibold">{product.name}</span>
                      {product.status === "Paused" && (
                        <span className="ml-auto shrink-0 text-[10px] font-bold text-amber-700">Paused</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn btn-secondary px-4 py-2 text-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{status === "uploading" ? "Uploading cover…" : status === "saving" ? "Saving…" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
