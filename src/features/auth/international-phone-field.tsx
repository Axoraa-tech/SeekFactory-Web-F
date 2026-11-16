"use client";

import { useEffect, useId, useState } from "react";
import { getCountries } from "libphonenumber-js";
import { PhoneInput } from "react-international-phone";
import { useTranslations } from "next-intl";

/** Browser preferences are a suggestion, not proof of location or nationality. */
export function suggestedPhoneCountry(languages: readonly string[]): string {
  const supported = new Set<string>(getCountries());
  for (const language of languages) {
    try {
      // Do not maximize: a language alone (e.g. English) does not identify a country.
      const region = new Intl.Locale(language).region;
      if (region && supported.has(region)) return region.toLowerCase();
    } catch {
      // Ignore malformed browser locale values.
    }
  }
  return "cn";
}

export function InternationalPhoneField({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations();
  const id = useId();
  const [country, setCountry] = useState<string>();
  useEffect(() => {
    setCountry(suggestedPhoneCountry(navigator.languages?.length ? navigator.languages : [navigator.language]));
  }, []);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-ink">{t("auth.card.registrationPhone")}</label>
      {country ? (
        <PhoneInput
          defaultCountry={country}
          value={value}
          onChange={onChange}
          inputProps={{ id, name: "phone", required: true, autoComplete: "tel", "aria-describedby": `${id}-hint` }}
          className="w-full"
          inputClassName="!h-10 sm:!h-10.5 !w-full !rounded-l-none !rounded-r-xl !border-slate-300 !text-sm !outline-none focus:!border-brand-orange focus:!ring-2 focus:!ring-brand-orange/20"
          countrySelectorStyleProps={{ buttonClassName: "!h-10 sm:!h-10.5 !rounded-l-xl !rounded-r-none !border-slate-300" }}
        />
      ) : <div className="h-10 rounded-xl border border-slate-300" aria-hidden="true" />}
      <p id={`${id}-hint`} className="text-xs text-ink-muted">{t("auth.card.phoneCountryHint")}</p>
    </div>
  );
}
