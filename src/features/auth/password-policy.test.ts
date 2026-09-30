import { describe, expect, it } from "vitest";
import { passwordPolicyErrors } from "@/features/auth/password-policy";

describe("passwordPolicyErrors", () => {
  it("accepts a password meeting the sign-up rules", () => {
    expect(passwordPolicyErrors("Password@123")).toEqual([]);
  });

  it("lists every missing rule", () => {
    expect(passwordPolicyErrors("short")).toEqual([
      "auth.policy.minLength",
      "auth.policy.upper",
      "auth.policy.number",
      "auth.policy.special",
    ]);
  });
});
