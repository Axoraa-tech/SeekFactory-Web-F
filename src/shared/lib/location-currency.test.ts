import { describe, expect, it } from "vitest";
import { currencyForLocation } from "./location-currency";

describe("currency from the visitor's location", () => {
  it("uses the device time zone first", () => {
    expect(currencyForLocation({ timeZone: "Asia/Shanghai", languages: ["en-US"] })).toBe("CNY");
    expect(currencyForLocation({ timeZone: "Asia/Kolkata", languages: ["en-US"] })).toBe("INR");
    expect(currencyForLocation({ timeZone: "Asia/Calcutta" })).toBe("INR");
    expect(currencyForLocation({ timeZone: "Europe/London" })).toBe("GBP");
    expect(currencyForLocation({ timeZone: "Europe/Berlin" })).toBe("EUR");
    expect(currencyForLocation({ timeZone: "America/Toronto" })).toBe("CAD");
    expect(currencyForLocation({ timeZone: "America/Chicago" })).toBe("USD");
    expect(currencyForLocation({ timeZone: "Asia/Dubai" })).toBe("AED");
    expect(currencyForLocation({ timeZone: "Asia/Tokyo" })).toBe("JPY");
    expect(currencyForLocation({ timeZone: "Australia/Sydney" })).toBe("AUD");
    expect(currencyForLocation({ timeZone: "Asia/Singapore" })).toBe("SGD");
  });

  it("falls back to the browser language region, then dollars", () => {
    expect(currencyForLocation({ timeZone: "Etc/UTC", languages: ["zh-CN", "en"] })).toBe("CNY");
    expect(currencyForLocation({ timeZone: "America/Sao_Paulo", languages: ["pt-BR", "en-IN"] })).toBe("INR");
    expect(currencyForLocation({ timeZone: "Asia/Hong_Kong", languages: ["en"] })).toBe("USD");
    expect(currencyForLocation({ languages: ["not a locale"] })).toBe("USD");
  });
});
