/**
 * The display currency for a first-time visitor, from where their device says it is: the time zone
 * first (set from the device's location, and needs no network call, which matters in mainland
 * China), then the region in the browser languages. A visitor's own currency choice always wins.
 */
export const SUPPORTED_DISPLAY_CURRENCIES = ["EUR", "USD", "INR", "CNY", "GBP", "JPY", "AED", "CAD", "AUD", "SGD"] as const;
export type DisplayCurrency = (typeof SUPPORTED_DISPLAY_CURRENCIES)[number];

/** International buyers and suppliers: dollars when nothing more specific is known. */
export const FALLBACK_CURRENCY: DisplayCurrency = "USD";

const EURO_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
  "AD", "MC", "SM", "VA", "ME", "XK",
]);

const COUNTRY_CURRENCY: Record<string, DisplayCurrency> = {
  CN: "CNY", IN: "INR", US: "USD", GB: "GBP", JP: "JPY", AE: "AED", CA: "CAD", AU: "AUD", SG: "SGD",
};

/** Time zones whose country is not obvious from the zone's prefix. */
const ZONE_COUNTRY: Record<string, string> = {
  "Asia/Shanghai": "CN", "Asia/Chongqing": "CN", "Asia/Chungking": "CN", "Asia/Harbin": "CN", "Asia/Urumqi": "CN",
  "Asia/Kashgar": "CN", PRC: "CN",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Tokyo": "JP", Japan: "JP",
  "Asia/Dubai": "AE",
  "Asia/Singapore": "SG", Singapore: "SG",
  "Asia/Nicosia": "CY", "Europe/Nicosia": "CY",
  "Europe/London": "GB", "Europe/Belfast": "GB", "Europe/Guernsey": "GB", "Europe/Jersey": "GB",
  "Europe/Isle_of_Man": "GB", GB: "GB",
  "Europe/Dublin": "IE", "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Busingen": "DE", "Europe/Madrid": "ES",
  "Atlantic/Canary": "ES", "Africa/Ceuta": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT", "Atlantic/Madeira": "PT",
  "Atlantic/Azores": "PT", "Europe/Helsinki": "FI", "Europe/Mariehamn": "FI", "Europe/Athens": "GR",
  "Europe/Luxembourg": "LU", "Europe/Bratislava": "SK", "Europe/Ljubljana": "SI", "Europe/Tallinn": "EE",
  "Europe/Riga": "LV", "Europe/Vilnius": "LT", "Europe/Malta": "MT", "Europe/Zagreb": "HR", "Europe/Monaco": "MC",
  "Europe/San_Marino": "SM", "Europe/Vatican": "VA", "Europe/Andorra": "AD", "Europe/Podgorica": "ME",
};

const CANADA_ZONES = new Set([
  "America/Toronto", "America/Montreal", "America/Vancouver", "America/Edmonton", "America/Winnipeg",
  "America/Halifax", "America/St_Johns", "America/Regina", "America/Moncton", "America/Glace_Bay",
  "America/Goose_Bay", "America/Whitehorse", "America/Dawson", "America/Dawson_Creek", "America/Fort_Nelson",
  "America/Yellowknife", "America/Inuvik", "America/Iqaluit", "America/Rankin_Inlet", "America/Resolute",
  "America/Cambridge_Bay", "America/Swift_Current", "America/Atikokan", "America/Creston", "America/Nipigon",
  "America/Thunder_Bay", "America/Rainy_River", "America/Pangnirtung",
]);
/** United States zones (other "America/" zones are Latin America, the Caribbean or Canada). */
const US_ZONES = new Set([
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix",
  "America/Anchorage", "America/Juneau", "America/Sitka", "America/Nome", "America/Yakutat", "America/Metlakatla",
  "America/Adak", "America/Boise", "America/Detroit", "America/Indiana/Indianapolis", "America/Indianapolis",
  "America/Kentucky/Louisville", "America/Louisville", "America/Menominee", "America/North_Dakota/Center",
  "Pacific/Honolulu", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific", "US/Alaska", "US/Hawaii",
]);

function countryForZone(zone: string): string | undefined {
  if (ZONE_COUNTRY[zone]) return ZONE_COUNTRY[zone];
  if (CANADA_ZONES.has(zone) || zone.startsWith("Canada/")) return "CA";
  if (US_ZONES.has(zone) || zone.startsWith("America/Indiana/") || zone.startsWith("America/Kentucky/")
    || zone.startsWith("America/North_Dakota/")) return "US";
  if (zone.startsWith("Australia/")) return "AU";
  return undefined;
}

export function currencyForCountry(country: string | undefined): DisplayCurrency | undefined {
  if (!country) return undefined;
  const code = country.toUpperCase();
  return COUNTRY_CURRENCY[code] ?? (EURO_COUNTRIES.has(code) ? "EUR" : undefined);
}

export function currencyForLocation({ timeZone, languages = [] }: { timeZone?: string; languages?: readonly string[] }): DisplayCurrency {
  const fromZone = timeZone ? currencyForCountry(countryForZone(timeZone)) : undefined;
  if (fromZone) return fromZone;
  for (const language of languages) {
    try {
      const fromLanguage = currencyForCountry(new Intl.Locale(language).region);
      if (fromLanguage) return fromLanguage;
    } catch {
      // Malformed browser language: try the next one
    }
  }
  return FALLBACK_CURRENCY;
}

/** The device's own location signals, read in the browser. */
export function browserLocationCurrency(): DisplayCurrency {
  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timeZone = undefined;
  }
  const languages = typeof navigator === "undefined" ? [] : navigator.languages?.length ? navigator.languages : [navigator.language];
  return currencyForLocation({ timeZone, languages });
}
