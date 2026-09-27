import { describe, expect, it } from "vitest";
import { passwordPolicyErrors } from "@/features/auth/password-policy";

describe("passwordPolicyErrors", () => {
  it("accepts a password meeting the sign-up rules", () => {
    expect(passwordPolicyErrors("Password@123")).toEqual([]);
  });

  it("lists every missing rule", () => {
    expect(passwordPolicyErrors("short")).toEqual([
      "At least 8 characters",
      "At least one uppercase letter",
      "At least one number",
      "At least one special character",
    ]);
  });
});
