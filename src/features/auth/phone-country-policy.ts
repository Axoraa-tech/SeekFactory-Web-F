import { getCountries, parsePhoneNumberFromString } from "libphonenumber-js/max";

/**
 * Signup phone policy: manufacturers register with a China (+86) number,
 * buyers with any other country's number. Sign-in accepts any country.
 */
export type PhoneAudience = "buyer" | "manufacturer" | "any";

const CHINA_ISO2 = "cn";
const CHINA_CALLING_CODE = "86";
const BUYER_FALLBACK_COUNTRY = "us";

export function isPhoneCountryAllowed(iso2: string, audience: PhoneAudience): boolean {
  const china = iso2.toLowerCase() === CHINA_ISO2;
  if (audience === "manufacturer") return china;
  if (audience === "buyer") return !china;
  return true;
}

/** True when the number's country calling code fits the audience. Validity is checked separately. */
export function isSignupPhoneAllowed(phone: string, audience: PhoneAudience): boolean {
  const parsed = parsePhoneNumberFromString(phone || "");
  if (!parsed) return false;
  const china = parsed.countryCallingCode === CHINA_CALLING_CODE;
  if (audience === "manufacturer") return china;
  if (audience === "buyer") return !china;
  return true;
}

/** Browser preferences are a suggestion, not proof of location or nationality. */
export function suggestedPhoneCountry(languages: readonly string[], audience: PhoneAudience = "any"): string {
  if (audience === "manufacturer") return CHINA_ISO2;
  const supported = new Set<string>(getCountries());
  for (const language of languages) {
    try {
      // Do not maximize: a language alone (e.g. English) does not identify a country.
      const region = new Intl.Locale(language).region;
      if (region && supported.has(region) && isPhoneCountryAllowed(region, audience)) return region.toLowerCase();
    } catch {
      // Ignore malformed browser locale values.
    }
  }
  return audience === "buyer" ? BUYER_FALLBACK_COUNTRY : CHINA_ISO2;
}
