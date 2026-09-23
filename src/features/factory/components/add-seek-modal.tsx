"use client";

import { useState, useRef } from "react";
import { X, Film, Play, UploadCloud, Video, Check } from "lucide-react";
import type { SellerProduct, SellerSeek } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  products: SellerProduct[];
  onAddSeek: (seek: SellerSeek) => void;
};

const SAMPLE_VIDEOS = [
  { label: "Factory Line 1 (Heavy CNC)", url: "/videos/reel-3-cnc-milling.mp4", duration: 32 },
  { label: "Factory Line 2 (Hot Forging)", url: "/videos/reel-6-hydraulic-testing.mp4", duration: 28 },
];

export function AddSeekModal({ isOpen, onClose, products, onAddSeek }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_VIDEOS[0]);
  const [deviceVideoSelected, setDeviceVideoSelected] = useState<string | null>(null);
  const [category, setCategory] = useState("CNC Machining");
  const [taggedProductId, setTaggedProductId] = useState<string>(products[0]?.id || "");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=600&q=80"
  );

  if (!isOpen) return null;

  function handleDeviceVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDeviceVideoSelected(objectUrl);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const taggedProd = products.find((p) => p.id === taggedProductId);
    // Replace blob URLs with a real file path for the prototype so it doesn't break on reload
    const finalVideoUrl = deviceVideoSelected ? "/videos/reel-5-automated-assembly.mp4" : selectedVideo.url;

    const newSeek: SellerSeek = {
      id: `seek-apex-${Date.now()}`,
      title: title.trim(),
      videoUrl: finalVideoUrl,
      thumbnailUrl:
        taggedProd?.imageUrl ||
        thumbnailUrl ||
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80",
      durationSeconds: selectedVideo.duration || 30,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      inquiriesGenerated: 0,
      taggedProductName: taggedProd?.name,
      category,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Published",
    };

    onAddSeek(newSeek);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface shadow-2xl border border-line">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Upload Video Seek (Short Reel)</h2>
              <p className="text-xs text-ink-muted">Showcase factory operations, machinery demonstrations & quality checks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Seek Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Video Title / Hook <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-Axis CNC Precision Machining Live Cutting Demonstration"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {/* Device Video File Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              Select Factory Footage / Video File <span className="text-red-500">*</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-line hover:border-brand-blue bg-canvas p-4 text-center transition flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleDeviceVideoChange}
                className="hidden"
              />
              {deviceVideoSelected ? (
                <div className="flex items-center gap-2 text-ink">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold">Device Video Ready for Playback</span>
                  <span className="text-[11px] text-brand-blue underline ml-1">Click to select another</span>
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-soft text-brand-blue group-hover:scale-105 transition-transform">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      Click to <span className="text-brand-blue font-bold underline">select video from your device</span>
                    </p>
                    <p className="text-[11px] text-ink-muted">MP4, WEBM, MOV up to 100MB</p>
                  </div>
                </>
              )}
            </div>

            {/* Or choose sample video footage */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-ink-muted mb-2">Or select preset demonstration footage:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_VIDEOS.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedVideo(v);
                      setDeviceVideoSelected(null);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition ${
                      selectedVideo.url === v.url && !deviceVideoSelected
                        ? "border-brand-blue bg-brand-blue-soft/60 text-ink"
                        : "border-line hover:border-neutral-300 bg-surface text-ink-muted"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-blue text-white shrink-0">
                      <Play className="h-3.5 w-3.5 fill-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{v.label}</p>
                      <p className="text-[10px] text-ink-muted">{v.duration}s MP4</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Preview Player */}
          <div className="rounded-xl overflow-hidden bg-black aspect-video relative max-h-48 flex items-center justify-center">
            <video
              src={deviceVideoSelected || selectedVideo.url}
              className="h-full w-full object-contain"
              controls
              muted
            />
          </div>

          {/* Category & Tagged Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Process Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden bg-surface"
              >
                <option value="CNC Machining">CNC Machining</option>
                <option value="Hot Forging">Hot Forging</option>
                <option value="Die Casting">Die Casting</option>
                <option value="Laser Cutting">Laser Cutting</option>
                <option value="Assembly Line">Assembly Line</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Tag Linked Product
              </label>
              <select
                value={taggedProductId}
                onChange={(e) => setTaggedProductId(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden bg-surface"
              >
                <option value="">-- No Product Tagged --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.length > 35 ? p.name.slice(0, 35) + "..." : p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom thumbnail URL (optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Custom Cover Thumbnail (Optional)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Custom thumbnail image URL (https://...)"
              className="w-full rounded-lg border border-line px-3.5 py-2 text-xs text-ink focus:border-brand-blue focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Caption / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe machine parameters, materials handled, and invitation for buyer inquiries..."
              className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-canvas transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Publish Seek Reel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
