/**
 * Admin-controlled layout for the home feed seek showcase.
 * Server-side only: read on each home render, cached for 30 seconds.
 */
export type ShowcaseMode = "DUAL" | "SINGLE" | "FEED" | "COMPACT" | "GRID" | "SPOTLIGHT";

export const SHOWCASE_MODES: ShowcaseMode[] = ["DUAL", "SINGLE", "FEED", "COMPACT", "GRID", "SPOTLIGHT"];

/** Anything unrecognised (older or newer backend) falls back to the dual layout. */
export function parseShowcaseMode(value: unknown): ShowcaseMode {
  return SHOWCASE_MODES.includes(value as ShowcaseMode) ? (value as ShowcaseMode) : "DUAL";
}

export type FeedShowcase = {
  mode: ShowcaseMode;
  autoplay: boolean;
  showProfile: boolean;
  showPhotos: boolean;
};

export const DEFAULT_SHOWCASE: FeedShowcase = { mode: "DUAL", autoplay: true, showProfile: true, showPhotos: true };

export async function loadShowcase(previewLayout?: string): Promise<FeedShowcase> {
  let settings = DEFAULT_SHOWCASE;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("localhost", "127.0.0.1");

  if (base) {
    try {
      const res = await fetch(`${base}/api/v1/settings/feed-showcase`, { next: { revalidate: 30 } });
      if (res.ok) {
        const d = (await res.json())?.data;
        if (d) {
          settings = {
            mode: parseShowcaseMode(d.mode),
            autoplay: d.autoplay !== false,
            showProfile: d.showProfile !== false,
            showPhotos: d.showPhotos !== false,
          };
        }
      }
    } catch {
      // Backend unreachable: keep today's dual layout
    }
  }

  // ?layout=<mode> previews a layout for this visitor only (used by the admin preview)
  const preview = previewLayout?.toUpperCase();
  if (preview && SHOWCASE_MODES.includes(preview as ShowcaseMode)) {
    return { ...settings, mode: preview as ShowcaseMode };
  }
  return settings;
}
