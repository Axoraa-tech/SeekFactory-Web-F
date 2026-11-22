import { describe, expect, it } from "vitest";
import { parseRecipients } from "./email-alerts";

describe("parseRecipients", () => {
  it("accepts lines, commas and semicolons, trims and removes repeats", () => {
    expect(parseRecipients(" Owner@Co.com\nops@co.com, owner@co.com;\n\n")).toEqual(["owner@co.com", "ops@co.com"]);
    expect(parseRecipients("")).toEqual([]);
  });
});
