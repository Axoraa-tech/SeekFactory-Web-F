"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Monitor, Smartphone, Tablet, Upload, RotateCcw } from "lucide-react";
import { AdminApiError, adminData, type AdminShowcase } from "@/shared/api/admin-api";
import { PageHeader, Pill, Toggle, formatDate, useToast } from "@/features/admin/ui";
import type { ShowcaseMode } from "@/features/feed/load-showcase";

type Draft = Pick<AdminShowcase, "mode" | "autoplay" | "showProfile" | "showPhotos">;

/**
 * The layouts an admin can publish, with the options each one actually honours.
 * `supports` drives which toggles stay enabled below, so an admin is never offered
 * a switch that the chosen layout ignores.
 */
const LAYOUTS = [
  {
    mode: "DUAL",
    title: "Dual video",
    description: "Two independent video columns",
    supports: { profile: false, photos: false, autoplay: true },
    thumb: (
      <div className="grid h-full grid-cols-[1fr_3fr_3fr_1fr] gap-1">
        <Block muted /><Block video /><Block video /><Block muted />
      </div>
    ),
  },
  {
    mode: "SINGLE",
    title: "Single video",
    description: "Profile · video · photos",
    supports: { profile: true, photos: true, autoplay: true },
    thumb: (
      <div className="grid h-full grid-cols-[2fr_5fr_2fr] gap-1">
        <Block profile /><Block video /><Block photos />
      </div>
    ),
  },
  {
    mode: "FEED",
    title: "Feed list",
    description: "One seek per row, LinkedIn feed",
    supports: { profile: true, photos: true, autoplay: true },
    thumb: (
      <div className="mx-auto flex h-full w-3/5 flex-col gap-1">
        <Block muted /><Block video /><Block muted />
      </div>
    ),
  },
  {
    mode: "COMPACT",
    title: "Compact list",
    description: "Dense rows, thumbnail and details",
    supports: { profile: true, photos: false, autoplay: false },
    thumb: (
      <div className="flex h-full flex-col gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid flex-1 grid-cols-[2fr_6fr] gap-1"><Block video /><Block muted /></div>
        ))}
      </div>
    ),
  },
  {
    mode: "GRID",
    title: "Grid tiles",
    description: "Poster cards, hover to preview",
    supports: { profile: true, photos: false, autoplay: true },
    thumb: (
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
        {Array.from({ length: 6 }).map((_, i) => <Block key={i} video />)}
      </div>
    ),
  },
  {
    mode: "SPOTLIGHT",
    title: "Spotlight + rail",
    description: "One hero seek above a carousel",
    supports: { profile: true, photos: true, autoplay: true },
    thumb: (
      <div className="flex h-full flex-col gap-1">
        <div className="flex-[3]"><Block video /></div>
        <div className="grid flex-[2] grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} muted />)}
        </div>
      </div>
    ),
  },
] as const satisfies readonly { mode: ShowcaseMode; title: string; description: string; supports: { profile: boolean; photos: boolean; autoplay: boolean }; thumb: React.ReactNode }[];

/** What each option means in the chosen layout — the wording changes, the stored flag does not. */
const PANEL_HINTS: Record<ShowcaseMode, { profile: string; photos: string; autoplay: string }> = {
  DUAL: {
    profile: "Not used by this layout.",
    photos: "Not used by this layout.",
    autoplay: "Start the seek in view automatically (muted).",
  },
  SINGLE: {
    profile: "Left panel, 280px. Hidden first as the window narrows.",
    photos: "Right panel on wide screens; a photo strip under the video on phones.",
    autoplay: "Start the seek in view automatically (muted).",
  },
  FEED: {
    profile: "Factory header above each seek, as on LinkedIn.",
    photos: "Product strip under each video.",
    autoplay: "Play the seek most in view; the others stay paused.",
  },
  COMPACT: {
    profile: "Factory line in each row; location only when off.",
    photos: "Not used: each row already shows a thumbnail.",
    autoplay: "Not used: this layout never plays video.",
  },
  GRID: {
    profile: "Factory line under each tile.",
    photos: "Not used: the tile itself is the photo.",
    autoplay: "Preview the video while the pointer is over a tile.",
  },
  SPOTLIGHT: {
    profile: "Factory panel beside the hero seek on wide screens.",
    photos: "Product strip under the hero seek.",
    autoplay: "Start the hero seek automatically (muted).",
  },
};

const RESPONSIVE_NOTES: Record<ShowcaseMode, string[]> = {
  DUAL: ["≥ 768px: two video columns", "< 768px: a single column"],
  SINGLE: [
    "≥ 1280px: profile · video · photos",
    "1024–1279px: profile collapses under the video, photos stay on the right",
    "< 1024px: full-width video with a photo strip underneath",
  ],
  FEED: ["Any width: one 680px column, centred", "Phones: full width with the same card order"],
  COMPACT: ["≥ 640px: thumbnail, details and actions on one row", "< 640px: actions move under the details"],
  GRID: ["≥ 1280px: three tiles per row", "640–1279px: two per row", "< 640px: one per row"],
  SPOTLIGHT: ["≥ 1280px: hero with the factory panel beside it", "< 1280px: hero full width, panel hidden", "Rail scrolls horizontally at every width"],
};

const DEVICES = [
  { key: "desktop", label: "Desktop", width: 1440, icon: Monitor },
  { key: "laptop", label: "Laptop", width: 1100, icon: Monitor },
  { key: "tablet", label: "Tablet", width: 800, icon: Tablet },
  { key: "phone", label: "Phone", width: 390, icon: Smartphone },
] as const;

export default function AdminShowcasePage() {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState<AdminShowcase | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    adminData.showcase()
      .then((s) => { setSaved(s); setDraft({ mode: s.mode, autoplay: s.autoplay, showProfile: s.showProfile, showPhotos: s.showPhotos }); })
      .catch((err) => {
        if (err instanceof AdminApiError && err.status === 401) router.replace("/admin/login");
        else toast("error", (err as Error).message);
      });
  }, [router, toast]);

  const dirty = useMemo(() => {
    if (!saved || !draft) return false;
    return saved.mode !== draft.mode || saved.autoplay !== draft.autoplay || saved.showProfile !== draft.showProfile || saved.showPhotos !== draft.showPhotos;
  }, [saved, draft]);

  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      const next = await adminData.publishShowcase(draft);
      setSaved(next);
      const title = LAYOUTS.find((l) => l.mode === draft.mode)?.title ?? draft.mode;
      toast("success", `Published: ${title} showcase. Live within 30 seconds.`);
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  if (!draft) {
    return (
      <div>
        <PageHeader title="Seek Showcase" subtitle="How seeks are presented on the website home feed" />
        <div className="h-96 rounded-xl border border-slate-200 bg-white p-6"><div className="h-full rounded bg-slate-100 animate-pulse" /></div>
      </div>
    );
  }

  // The preview only reflects the layout mode via ?layout=; panel/autoplay toggles apply after publishing
  const previewUrl = `/?layout=${draft.mode.toLowerCase()}&preview=${previewKey}`;
  const width = DEVICES.find((d) => d.key === device)!.width;
  const layout = LAYOUTS.find((l) => l.mode === draft.mode) ?? LAYOUTS[0];

  return (
    <div>
      <PageHeader
        title="Seek Showcase"
        subtitle="How seeks are presented on the website home feed"
        actions={
          <>
            {saved?.updatedAt && (
              <span className="hidden text-xs text-slate-500 md:inline">
                Last published {formatDate(saved.updatedAt)}{saved.updatedBy ? ` by ${saved.updatedBy}` : ""}
              </span>
            )}
            {dirty && (
              <button
                onClick={() => saved && setDraft({ mode: saved.mode, autoplay: saved.autoplay, showProfile: saved.showProfile, showPhotos: saved.showPhotos })}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4" /> Discard
              </button>
            )}
            <button
              onClick={publish}
              disabled={!dirty || publishing}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400 disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Publish
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Controls */}
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-slate-900">Layout</h3>
            <div className="grid grid-cols-2 gap-3">
              {LAYOUTS.map((l) => (
                <LayoutCard
                  key={l.mode}
                  selected={draft.mode === l.mode}
                  onSelect={() => setDraft({ ...draft, mode: l.mode })}
                  title={l.title}
                  description={l.description}
                  live={saved?.mode === l.mode}
                >
                  {l.thumb}
                </LayoutCard>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900">Options</h3>
            <p className="mt-0.5 text-xs text-slate-500">Greyed-out options are ignored by {layout.title}.</p>
            <div className="mt-4 space-y-4">
              <Option
                label="Factory profile"
                hint={PANEL_HINTS[draft.mode].profile}
                checked={draft.showProfile}
                disabled={!layout.supports.profile}
                onChange={(v) => setDraft({ ...draft, showProfile: v })}
              />
              <Option
                label="Seek photos"
                hint={PANEL_HINTS[draft.mode].photos}
                checked={draft.showPhotos}
                disabled={!layout.supports.photos}
                onChange={(v) => setDraft({ ...draft, showPhotos: v })}
              />
              <Option
                label="Autoplay"
                hint={PANEL_HINTS[draft.mode].autoplay}
                checked={draft.autoplay}
                disabled={!layout.supports.autoplay}
                onChange={(v) => setDraft({ ...draft, autoplay: v })}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 space-y-1.5">
            <p className="font-medium text-slate-900">Responsive behaviour ({layout.title.toLowerCase()})</p>
            {RESPONSIVE_NOTES[draft.mode].map((line) => <p key={line}>{line}</p>)}
          </section>
        </div>

        {/* Preview */}
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-900">Preview</h3>
              {dirty && <Pill tone="amber">Unpublished changes</Pill>}
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 p-1" role="group" aria-label="Preview size">
              {DEVICES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDevice(d.key)}
                  aria-pressed={device === d.key}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${device === d.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <d.icon className="w-3.5 h-3.5" />{d.label}
                </button>
              ))}
              <button onClick={() => setPreviewKey((k) => k + 1)} className="ml-1 rounded-md px-2 text-slate-500 hover:text-slate-900" aria-label="Reload preview">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <ScaledFrame src={previewUrl} width={width} />
          <p className="mt-2 text-xs text-slate-500">
            Preview shows the selected layout at {width}px. Panel and autoplay options take effect on the live site after publishing.
          </p>
        </section>
      </div>
    </div>
  );
}

/** Renders the real home page at a device width, scaled down to fit the preview column. */
function ScaledFrame({ src, width }: { src: string; width: number }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [available, setAvailable] = useState(0);
  useEffect(() => {
    if (!box) return;
    const ro = new ResizeObserver(([e]) => setAvailable(e.contentRect.width));
    ro.observe(box);
    return () => ro.disconnect();
  }, [box]);
  const height = 820;
  const scale = available ? Math.min(1, available / width) : 1;
  return (
    <div ref={setBox} className="w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100" style={{ height: height * scale }}>
      {available > 0 && (
        <iframe
          key={src + width}
          src={src}
          title="Home feed preview"
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left", marginLeft: Math.max(0, (available - width * scale) / 2) }}
          className="border-0 bg-white"
        />
      )}
    </div>
  );
}

function LayoutCard({ selected, onSelect, title, description, live, children }: {
  selected: boolean; onSelect: () => void; title: string; description: string; live?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border-2 p-3 text-left transition-colors ${selected ? "border-orange-500 bg-orange-50/40" : "border-slate-200 hover:border-slate-300"}`}
    >
      <div className="h-16 rounded-md bg-white p-1.5 border border-slate-200">{children}</div>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-900">
        {title} {live && <Pill tone="green">Live</Pill>}
      </p>
      <p className="text-xs text-slate-500">{description}</p>
    </button>
  );
}

function Block({ video, profile, photos, muted }: { video?: boolean; profile?: boolean; photos?: boolean; muted?: boolean }) {
  if (video) return <div className="rounded-sm bg-slate-800" />;
  if (profile) return <div className="rounded-sm bg-orange-200" />;
  if (photos) return <div className="grid grid-cols-2 gap-0.5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-[2px] bg-blue-200" />)}</div>;
  return <div className={`rounded-sm ${muted ? "bg-slate-100" : "bg-slate-200"}`} />;
}

function Option({ label, hint, checked, onChange, disabled }: {
  label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <p className="text-sm text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      {/* The stored flag is kept when a layout ignores it, so switching back restores the choice */}
      <div className={disabled ? "pointer-events-none" : ""} aria-disabled={disabled}>
        <Toggle checked={checked} label={label} onChange={onChange} />
      </div>
    </div>
  );
}
