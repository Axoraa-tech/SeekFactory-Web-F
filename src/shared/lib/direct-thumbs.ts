/**
 * Photo thumbnails straight from public storage instead of through the API.
 *
 * Every `/api/v1/media/<key>?w=640` costs the browser a request to the API, then a redirect to storage:
 * one extra round trip per photo, and mainland China pays ~0.3-1 s for each. The backend now keeps every
 * thumbnail at a name the browser can work out (`media/variants/<uuid>-w<width>.<original ext>`), so the
 * page asks storage directly. A thumbnail that is not there yet (a photo from before the backfill)
 * fails once and is swapped for the API address by {@link THUMB_FALLBACK_SCRIPT}, which makes it.
 *
 * Switch: NEXT_PUBLIC_DIRECT_THUMBS=true (needs NEXT_PUBLIC_MEDIA_BASE_URL); off = always via the API.
 */
export const DIRECT_THUMBS = process.env.NEXT_PUBLIC_DIRECT_THUMBS === "true";

const VARIANT = /\/media\/variants\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-w(160|640|1280)\.(png|jpg)$/;

/** `<media base>/media/variants/<uuid>-w<width>.<ext>` for a stored key such as `<uuid>.png`. */
export function directThumbUrl(mediaPrefix: string, key: string, width: number): string {
  const dot = key.lastIndexOf(".");
  return `${mediaPrefix}variants/${key.slice(0, dot)}-w${width}${key.slice(dot)}`;
}

/** The API address that makes and serves the same thumbnail, or null for anything else. */
export function apiThumbFor(directUrl: string, apiOrigin: string): string | null {
  const m = directUrl.match(VARIANT);
  return m ? `${apiOrigin}/api/v1/media/${m[1]}.${m[3]}?w=${m[2]}` : null;
}

/**
 * Inline, runs before the page's images load: an <img> whose direct thumbnail is missing switches to
 * the API address (once). Kept tiny and dependency-free because it is embedded in every page's HTML.
 */
export function thumbFallbackScript(apiOrigin: string): string {
  return `(function(){var re=${VARIANT.toString()},o=${JSON.stringify(apiOrigin)};document.addEventListener("error",function(e){var t=e.target;if(!t||t.tagName!=="IMG"||t.dataset.thumbFallback)return;var m=(t.currentSrc||t.src||"").match(re);if(!m)return;t.dataset.thumbFallback="1";t.removeAttribute("srcset");t.src=o+"/api/v1/media/"+m[1]+"."+m[3]+"?w="+m[2];},true);})();`;
}
