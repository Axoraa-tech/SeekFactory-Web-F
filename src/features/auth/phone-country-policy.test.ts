import { describe, expect, it } from "vitest";
import { isPhoneCountryAllowed, isSignupPhoneAllowed, suggestedPhoneCountry } from "./phone-country-policy";

describe("phone country policy", () => {
  it("offers buyers every country except China and manufacturers China only", () => {
    expect(isPhoneCountryAllowed("cn", "buyer")).toBe(false);
    expect(isPhoneCountryAllowed("in", "buyer")).toBe(true);
    expect(isPhoneCountryAllowed("hk", "buyer")).toBe(true);
    expect(isPhoneCountryAllowed("cn", "manufacturer")).toBe(true);
    expect(isPhoneCountryAllowed("gb", "manufacturer")).toBe(false);
    expect(isPhoneCountryAllowed("cn", "any")).toBe(true);
  });

  it("checks the number's calling code against the role", () => {
    expect(isSignupPhoneAllowed("+8613812345678", "manufacturer")).toBe(true);
    expect(isSignupPhoneAllowed("+919876543210", "manufacturer")).toBe(false);
    expect(isSignupPhoneAllowed("+8613812345678", "buyer")).toBe(false);
    expect(isSignupPhoneAllowed("+442079460018", "buyer")).toBe(true);
    expect(isSignupPhoneAllowed("+85291234567", "buyer")).toBe(true);
    expect(isSignupPhoneAllowed("", "buyer")).toBe(false);
  });

  it("suggests an allowed default country", () => {
    expect(suggestedPhoneCountry(["en-IN"], "manufacturer")).toBe("cn");
    expect(suggestedPhoneCountry(["zh-CN", "en-GB"], "buyer")).toBe("gb");
    expect(suggestedPhoneCountry(["zh-CN"], "buyer")).toBe("us");
    expect(suggestedPhoneCountry(["en"], "buyer")).toBe("us");
    expect(suggestedPhoneCountry(["en-IN"], "buyer")).toBe("in");
  });
});
