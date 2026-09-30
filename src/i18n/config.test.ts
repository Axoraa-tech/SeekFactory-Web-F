import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage, toLocale } from "@/i18n/config";

describe("localeFromAcceptLanguage", () => {
  it("defaults to English without a header", () => {
    expect(localeFromAcceptLanguage(undefined)).toBe("en");
    expect(localeFromAcceptLanguage("")).toBe("en");
  });

  it("picks Chinese for a Chinese browser", () => {
    expect(localeFromAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
    expect(localeFromAcceptLanguage("zh-TW")).toBe("zh");
  });

  it("keeps English when the browser ranks it first", () => {
    expect(localeFromAcceptLanguage("en-IN,en;q=0.9,zh;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("hi-IN,en;q=0.7,zh;q=0.5")).toBe("en");
  });

  it("respects q-values over header order", () => {
    expect(localeFromAcceptLanguage("en;q=0.4,zh-CN;q=0.9")).toBe("zh");
  });

  it("falls back to English for other languages", () => {
    expect(localeFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("en");
  });
});

describe("toLocale", () => {
  it("maps saved cookie values", () => {
    expect(toLocale("ZH")).toBe("zh");
    expect(toLocale("EN")).toBe("en");
    expect(toLocale(undefined)).toBe("en");
  });
});
