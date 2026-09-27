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
  it("status is from this factory's point of view", () => {
    expect(toSellerRfq(rfq).status).toBe("New");
    // Another factory quoted (global QUOTED) but we have not: still New for us
    expect(toSellerRfq({ ...rfq, status: "QUOTED" }).status).toBe("New");
    expect(toSellerRfq({ ...rfq, status: "QUOTED", quotedPriceInr: 1200 }).status).toBe("Quoted");
    for (const closed of ["ACCEPTED", "IN_PRODUCTION", "COMPLETED", "cancelled"]) {
      expect(toSellerRfq({ ...rfq, status: closed, quotedPriceInr: 1200 }).status).toBe("Closed");
    }
    expect(toSellerRfq({ ...rfq, status: "SOMETHING_ELSE" }).status).toBe("New");
  });

  it("uses the category name, falling back to a legacy [tag] in details", () => {
    const categories = [{ id: "cat-x", slug: "x", name: "Forging Presses", listingCount: 0, parentId: null, icon: "other" as const }];
    expect(toSellerRfq({ ...rfq, categoryId: "cat-x" }, categories).productCategory).toBe("Forging Presses");
    expect(toSellerRfq(rfq).productCategory).toBe("Forging Parts");
  });

  it("ignores non-numeric budgets and never invents buyer details", () => {
    const mapped = toSellerRfq(rfq);
    expect(mapped.targetBudgetInr).toBeUndefined();
    expect(toSellerRfq({ ...rfq, targetPrice: "1850000" }).targetBudgetInr).toBe(1850000);
    expect(mapped.buyerCountry).toBe("");
    expect(toSellerRfq({ ...rfq, buyerName: "Arjun", buyerCountry: "India" })).toMatchObject({
      buyerName: "Arjun",
      buyerCountry: "India",
    });
  });

  it("carries this factory's quote through", () => {
    const mapped = toSellerRfq({ ...rfq, quotedPriceInr: 99, leadTimeDays: 7, quoteIncoterm: "CIF", quoteNotes: "ok" });
    expect(mapped).toMatchObject({ quotedPriceInr: 99, leadTimeDays: 7, quoteIncoterm: "CIF", quoteNotes: "ok" });
  });
});

describe("toManufacturerUpdate", () => {
  it("drops unset fields so partial saves do not blank the profile", () => {
    const update = toManufacturerUpdate({ certificates: [] });
    expect(update).toEqual({ certificates: [] });
    expect("name" in update).toBe(false);
  });
});
