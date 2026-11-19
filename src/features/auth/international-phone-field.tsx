"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { defaultCountries, parseCountry, PhoneInput } from "react-international-phone";
import { useTranslations } from "next-intl";
import {
  isPhoneCountryAllowed,
  suggestedPhoneCountry,
  type PhoneAudience,
} from "@/features/auth/phone-country-policy";

export { suggestedPhoneCountry } from "@/features/auth/phone-country-policy";

export function InternationalPhoneField({ value, onChange, audience = "any" }: {
  value: string;
  onChange: (value: string) => void;
  /** Buyers: every country except China. Manufacturers: China (+86) only. */
  audience?: PhoneAudience;
}) {
  const t = useTranslations();
  const id = useId();
  const [languages, setLanguages] = useState<readonly string[]>();
  useEffect(() => {
    setLanguages(navigator.languages?.length ? navigator.languages : [navigator.language]);
  }, []);

  const countries = useMemo(
    () => defaultCountries.filter((country) => isPhoneCountryAllowed(parseCountry(country).iso2, audience)),
    [audience],
  );
  const country = languages ? suggestedPhoneCountry(languages, audience) : undefined;
  const chinaOnly = audience === "manufacturer";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-ink">{t("auth.card.registrationPhone")}</label>
      {country ? (
        <PhoneInput
          // Remount when the role changes so the country list and default country reset
          key={audience}
          defaultCountry={country}
          countries={countries}
          forceDialCode={chinaOnly}
          hideDropdown={chinaOnly}
          value={value}
          onChange={onChange}
          inputProps={{ id, name: "phone", required: true, autoComplete: "tel", "aria-describedby": `${id}-hint` }}
          className="w-full"
          inputClassName="!h-10 sm:!h-10.5 !w-full !rounded-l-none !rounded-r-xl !border-slate-300 !text-sm !outline-none focus:!border-brand-orange focus:!ring-2 focus:!ring-brand-orange/20"
          countrySelectorStyleProps={{ buttonClassName: "!h-10 sm:!h-10.5 !rounded-l-xl !rounded-r-none !border-slate-300" }}
        />
      ) : <div className="h-10 rounded-xl border border-slate-300" aria-hidden="true" />}
      <p id={`${id}-hint`} className="text-xs text-ink-muted">
        {audience === "manufacturer"
          ? t("auth.card.manufacturerPhoneHint")
          : audience === "buyer"
            ? t("auth.card.buyerPhoneHint")
            : t("auth.card.phoneCountryHint")}
      </p>
    </div>
  );
}
