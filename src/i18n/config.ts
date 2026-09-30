/** The two UI languages. User-entered content (product and seek text, names, chats) is never translated. */
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Remembers the chosen language for a year; read on the server so pages render in it (no flash). */
export const LOCALE_COOKIE = "seek_lang";

/** Cookie values from the old language menu were upper-case codes ("ZH", "EN"). */
export function toLocale(value: string | undefined | null): Locale {
  return value?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/**
 * First visit (no saved choice): pick the UI language from the browser's Accept-Language header.
 * Chinese wins only when the browser ranks it above English, so bilingual users who prefer English
 * (e.g. "en-IN,en;q=0.9,zh;q=0.8") still get English.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag, q: q ? Number(q.trim().slice(2)) || 0 : 1, index };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of ranked) {
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
