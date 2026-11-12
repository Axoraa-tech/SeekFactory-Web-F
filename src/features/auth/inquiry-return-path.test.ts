import { describe, expect, it } from "vitest";
import { inquiryReturnPath } from "./inquiry-return-path";

describe("inquiry sign-in destination", () => {
  it("retains the supplier chat target and product context", () => {
    expect(inquiryReturnPath("/messages", { with: "factory-one", product: "machine", action: "buy" }))
      .toBe("/messages?with=factory-one&product=machine&action=buy");
  });
  it("retains an existing conversation", () => {
    expect(inquiryReturnPath("/messages", { conversation: "thread-1" })).toBe("/messages?conversation=thread-1");
  });
  it("retains product and category for RFQ prefill", () => {
    expect(inquiryReturnPath("/rfq/new", { product: "machine", category: "cat-tools" }))
      .toBe("/rfq/new?product=machine&category=cat-tools");
  });
  it("keeps a fixed local destination and encodes values", () => {
    expect(inquiryReturnPath("/messages", { with: "a&next=https://evil.test", next: "https://evil.test" }))
      .toBe("/messages?with=a%26next%3Dhttps%3A%2F%2Fevil.test");
  });
  it("uses the first repeated value and omits empty values", () => {
    expect(inquiryReturnPath("/messages", { with: ["one", "two"], product: "" })).toBe("/messages?with=one");
    expect(inquiryReturnPath("/rfq/new", {})).toBe("/rfq/new");
  });
});
