import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, localeFromAcceptLanguage, toLocale } from "./config";

export default getRequestConfig(async () => {
  // A saved choice (the EN / 中 switch) wins; on a first visit, follow the browser's language
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = saved ? toLocale(saved) : localeFromAcceptLanguage((await headers()).get("accept-language"));
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Asia/Kolkata",
  };
});
