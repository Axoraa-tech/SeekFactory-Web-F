import en from "../../../messages/en.json";
import zh from "../../../messages/zh.json";

export type AppLocale = "en" | "zh";

const catalogs = {
  en,
  zh,
} as const;

export type MessageCatalog = typeof en;

/** Light i18n helper — EN default until next-intl (or similar) is wired. */
export function getMessages(locale: AppLocale = "en"): MessageCatalog {
  return catalogs[locale] ?? catalogs.en;
}

export function t(
  catalog: MessageCatalog,
  path: string,
  fallback = ""
): string {
  const parts = path.split(".");
  let current: unknown = catalog;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return fallback || path;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : fallback || path;
}
