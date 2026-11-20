import { describe, expect, it } from "vitest";
import { resourceHintOrigins } from "./resource-hints";

describe("resourceHintOrigins", () => {
  it("returns each configured origin once, media first", () => {
    expect(resourceHintOrigins("https://acct.blob.core.windows.net/media/", "https://api.example.com")).toEqual([
      "https://acct.blob.core.windows.net",
      "https://api.example.com",
    ]);
    expect(resourceHintOrigins("https://a.example.com/x", "https://a.example.com")).toEqual(["https://a.example.com"]);
  });

  it("skips unset or relative values", () => {
    expect(resourceHintOrigins(undefined, "", "  ", "/api")).toEqual([]);
  });
});
