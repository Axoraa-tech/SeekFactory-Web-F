import { describe, expect, it } from "vitest";
import { formatPriceRange, parsePriceInput, rangeMax, sanitizePriceInput, validatePriceRange } from "./price-range";

describe("sanitizePriceInput", () => {
  it("drops the leading zero left by a cleared number box", () => {
    expect(sanitizePriceInput("05")).toBe("5");
    expect(sanitizePriceInput("0025000")).toBe("25000");
  });
  it("keeps a single zero and decimals", () => {
    expect(sanitizePriceInput("0")).toBe("0");
    expect(sanitizePriceInput("0.5")).toBe("0.5");
    expect(sanitizePriceInput(".5")).toBe("0.5");
    expect(sanitizePriceInput("12.345")).toBe("12.34");
    expect(sanitizePriceInput("1.2.3")).toBe("1.23");
  });
  it("strips signs, letters and separators", () => {
    expect(sanitizePriceInput("-1,200abc")).toBe("1200");
    expect(sanitizePriceInput("")).toBe("");
  });
});

describe("parsePriceInput", () => {
  it("treats empty as not entered", () => {
    expect(parsePriceInput("")).toBeUndefined();
    expect(parsePriceInput("250")).toBe(250);
  });
});

describe("validatePriceRange", () => {
  it("accepts a single price and a valid range", () => {
    expect(validatePriceRange(100, undefined)).toBeNull();
    expect(validatePriceRange(100, 100)).toBeNull();
    expect(validatePriceRange(100, 250)).toBeNull();
  });
  it("rejects missing, zero or negative amounts", () => {
    expect(validatePriceRange(undefined, undefined)).toBe("minRequired");
    expect(validatePriceRange(0, undefined)).toBe("minRequired");
    expect(validatePriceRange(-1, undefined)).toBe("negative");
    expect(validatePriceRange(10, -5)).toBe("negative");
  });
  it("rejects a maximum below the minimum", () => {
    expect(validatePriceRange(100, 99)).toBe("maxBelowMin");
  });
});

describe("formatPriceRange", () => {
  const fmt = (n: number) => `₹${n}`;
  it("shows a single price when there is no higher maximum", () => {
    expect(formatPriceRange(100, undefined, fmt)).toBe("₹100");
    expect(formatPriceRange(100, null, fmt)).toBe("₹100");
    expect(formatPriceRange(100, 100, fmt)).toBe("₹100");
    expect(rangeMax(100, 50)).toBeUndefined();
  });
  it("shows a range", () => {
    expect(formatPriceRange(100, 250, fmt)).toBe("₹100 – ₹250");
  });
});
