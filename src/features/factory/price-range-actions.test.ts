import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateProductAction } from "./actions";
const updateProduct = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "p" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key }));
vi.mock("@/shared/api", () => ({ getApi: () => ({
  session: { getCurrentUser: async () => ({ role: "Supplier" }) },
  factory: { updateProduct },
}) }));
beforeEach(() => vi.clearAllMocks());
describe("price maximum partial updates", () => {
  it.each([{}, { priceInr: 100 }, { priceMaxInr: null }, { priceMaxInr: 250 }])("forwards supported patch %j", async (input) => {
    expect((await updateProductAction("p", input)).ok).toBe(true);
    expect(updateProduct).toHaveBeenCalledWith("p", { ...input, name: undefined });
  });
  it.each([-1, Infinity, NaN])("rejects invalid maximum %s without sending", async (priceMaxInr) => {
    expect((await updateProductAction("p", { priceMaxInr })).ok).toBe(false);
    expect(updateProduct).not.toHaveBeenCalled();
  });
  it("rejects an inverted range", async () => {
    expect((await updateProductAction("p", { priceInr: 100, priceMaxInr: 99 })).ok).toBe(false);
    expect(updateProduct).not.toHaveBeenCalled();
  });
});
