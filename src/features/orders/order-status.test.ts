import { describe, expect, it } from "vitest";
import { defaultOrderQuantity } from "@/features/orders/order-status";

describe("defaultOrderQuantity", () => {
  it("uses the leading number of the MOQ", () => {
    expect(defaultOrderQuantity("50 pieces")).toBe(50);
    expect(defaultOrderQuantity("1,200 units")).toBe(1200);
    expect(defaultOrderQuantity(3)).toBe(3);
  });

  it("falls back to 1 when the MOQ has no usable number", () => {
    expect(defaultOrderQuantity(undefined)).toBe(1);
    expect(defaultOrderQuantity("Negotiable")).toBe(1);
    expect(defaultOrderQuantity("0 sets")).toBe(1);
  });
});
