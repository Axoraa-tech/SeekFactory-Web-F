import { describe, expect, it } from "vitest";
import { INTRO_MAX_MS, INTRO_MIN_MS, introRemainingMs } from "./intro-timing";

describe("introRemainingMs", () => {
  it("waits up to the hard maximum while the first seek loads", () => {
    expect(introRemainingMs(0, false)).toBe(INTRO_MAX_MS);
    expect(introRemainingMs(4000, false)).toBe(1000);
    expect(introRemainingMs(9000, false)).toBe(0);
  });

  it("keeps the minimum when the seek is ready early", () => {
    expect(introRemainingMs(200, true)).toBe(INTRO_MIN_MS - 200);
  });

  it("ends at once when the seek is ready after the minimum", () => {
    expect(introRemainingMs(2600, true)).toBe(0);
  });
});
