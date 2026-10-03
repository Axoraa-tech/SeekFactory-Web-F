import { describe, expect, it } from "vitest";
import { normaliseBackendOrigin } from "@/features/auth/backend-url";

describe("normaliseBackendOrigin", () => {
  it("accepts the bare origin", () => {
    expect(normaliseBackendOrigin("https://api.onrender.com")).toBe("https://api.onrender.com");
  });

  it("strips the API prefix so one variable serves every route", () => {
    expect(normaliseBackendOrigin("https://api.onrender.com/api/v1")).toBe("https://api.onrender.com");
  });

  it("strips trailing slashes, with or without the prefix", () => {
    expect(normaliseBackendOrigin("https://api.onrender.com/")).toBe("https://api.onrender.com");
    expect(normaliseBackendOrigin("https://api.onrender.com/api/v1/")).toBe("https://api.onrender.com");
  });

  it("trims whitespace pasted into a dashboard", () => {
    expect(normaliseBackendOrigin("  https://api.onrender.com \n")).toBe("https://api.onrender.com");
  });

  it("avoids the IPv6 localhost resolution failure on Node 18+", () => {
    expect(normaliseBackendOrigin("http://localhost:8080/api/v1")).toBe("http://127.0.0.1:8080");
  });

  it("returns empty for unset so the caller can apply its default", () => {
    expect(normaliseBackendOrigin(undefined)).toBe("");
    expect(normaliseBackendOrigin("")).toBe("");
  });
});
