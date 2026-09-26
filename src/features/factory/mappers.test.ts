import { describe, expect, it } from "vitest";
import type { RfqItem } from "@/entities/rfq";
import { toManufacturerUpdate, toSellerRfq } from "@/features/factory/mappers";

const rfq: RfqItem = {
  id: "r1",
  referenceNumber: "RFQ-1",
  productName: "Flanges",
  quantity: "800",
  status: "SUBMITTED",
  createdAt: "2026-09-12T11:02:00.000Z",
  details: "[Forging Parts] ASTM A105N",
  targetPrice: "Negotiable",
};

describe("toSellerRfq", () => {
  it("maps backend statuses to seller hub statuses", () => {
    expect(toSellerRfq(rfq).status).toBe("New");
    expect(toSellerRfq({ ...rfq, status: "QUOTED" }).status).toBe("Quoted");
    expect(toSellerRfq({ ...rfq, status: "under review" }).status).toBe("Under Review");
    expect(toSellerRfq({ ...rfq, status: "SOMETHING_ELSE" }).status).toBe("New");
  });

  it("extracts category tag and ignores non-numeric budgets", () => {
    const mapped = toSellerRfq(rfq);
    expect(mapped.productCategory).toBe("Forging Parts");
    expect(mapped.targetBudgetInr).toBeUndefined();
    expect(toSellerRfq({ ...rfq, targetPrice: "1850000" }).targetBudgetInr).toBe(1850000);
  });

  it("carries an existing quote through", () => {
    const mapped = toSellerRfq({ ...rfq, status: "QUOTED", quotedPriceInr: 99, leadTimeDays: 7 });
    expect(mapped).toMatchObject({ quotedPriceInr: 99, leadTimeDays: 7 });
  });
});

describe("toManufacturerUpdate", () => {
  it("drops unset fields so partial saves do not blank the profile", () => {
    const update = toManufacturerUpdate({ certificates: [] });
    expect(update).toEqual({ certificates: [] });
    expect("name" in update).toBe(false);
  });
});
