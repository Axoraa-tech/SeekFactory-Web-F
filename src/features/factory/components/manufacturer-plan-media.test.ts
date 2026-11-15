// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddProductModal } from "./add-product-modal";
import { ProductLimitModal } from "./product-limit-modal";
import { ProfileVideoSection, isAcceptedProfileVideo } from "./profile-video-section";
import { ProductsTab } from "../tabs/products-tab";
import type { SellerProduct } from "../types";
import type { Category } from "@/entities/category";

const uploadMedia = vi.hoisted(() => vi.fn().mockResolvedValue({ url: "/api/v1/media/uploaded.mp4" }));
vi.mock("@/shared/api", () => ({ getApi: () => ({ factory: { uploadMedia } }) }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, vars?: Record<string, unknown>) => (vars ? `${key} ${JSON.stringify(vars)}` : key),
}));
vi.mock("@/shared/i18n/regional-context", () => ({ useRegionalSettings: () => ({ translateCategory: (c: string) => c }) }));

const categories: Category[] = [{ id: "c1", slug: "machinery", name: "Machinery", parentId: null, listingCount: 1, icon: "machine-tools" }];

function product(id: string): SellerProduct {
  return {
    id, name: `P ${id}`, slug: id, imageUrl: "/cover.png", imageUrls: ["/cover.png"],
    category: "Machinery", categoryId: "c1", priceInr: 100, unit: "Set", moq: "1 Set",
    status: "Active", stockStatus: "IN_STOCK", viewsCount: 0, inquiriesCount: 0,
    specs: {}, description: "", createdAt: "Today",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

const image = (name: string) => new File(["i"], name, { type: "image/png" });

describe("product photos", () => {
  it("accepts at most four photos and explains the limit", () => {
    const { container } = render(createElement(AddProductModal, {
      isOpen: true, categories, onSubmit: vi.fn(), onClose: vi.fn(),
    }));
    const input = container.querySelector('input[type="file"][multiple]')!;
    fireEvent.change(input, { target: { files: [1, 2, 3, 4, 5].map((n) => image(`${n}.png`)) } });
    expect(container.querySelectorAll("img")).toHaveLength(4);
    expect(screen.getByText(/seller\.product\.onlyTheFirstPhotoS.*"MAX_IMAGES":4/)).toBeTruthy();
    fireEvent.change(input, { target: { files: [image("6.png")] } });
    expect(screen.getByText(/seller\.product\.aProductCanHaveAt/)).toBeTruthy();
  });

  it("keeps all photos of a product saved under the old eight-photo cap", () => {
    const legacy = { ...product("old"), imageUrls: Array.from({ length: 8 }, (_, i) => `/p${i}.png`) };
    const { container } = render(createElement(AddProductModal, {
      isOpen: true, categories, product: legacy, onSubmit: vi.fn(), onClose: vi.fn(),
    }));
    expect(container.querySelectorAll("img")).toHaveLength(8);
  });
});

describe("product limit feedback", () => {
  const tabProps = {
    onOpenAddProduct: vi.fn(), onEditProduct: vi.fn(), onSetListed: vi.fn(), onSetStock: vi.fn(), onDeleteProduct: vi.fn(),
  };

  it("shows usage below the limit", () => {
    render(createElement(ProductsTab, { ...tabProps, products: [product("a")], productLimit: 3, onRequestUpgrade: vi.fn() }));
    expect(screen.getByTestId("product-limit-banner").textContent).toContain('seller.plan.productsUsed {"count":1,"limit":3}');
  });

  it("explains the reached limit and offers Upgrade the plan / Contact admin", () => {
    const onRequestUpgrade = vi.fn();
    render(createElement(ProductsTab, {
      ...tabProps, products: ["a", "b", "c"].map(product), productLimit: 3, onRequestUpgrade,
    }));
    expect(screen.getByText("seller.plan.limitReachedTitle")).toBeTruthy();
    fireEvent.click(screen.getByText("seller.plan.upgradeCta"));
    expect(onRequestUpgrade).toHaveBeenCalled();
  });

  it("grandfathered factories above the limit keep every product listed", () => {
    render(createElement(ProductsTab, {
      ...tabProps, products: ["a", "b", "c", "d", "e"].map(product), productLimit: 3, onRequestUpgrade: vi.fn(),
    }));
    expect(screen.getAllByText(/^P [a-e]$/)).toHaveLength(5);
  });

  it("hides the banner when the limit is unknown", () => {
    render(createElement(ProductsTab, { ...tabProps, products: [product("a")] }));
    expect(screen.queryByTestId("product-limit-banner")).toBeNull();
  });
});

describe("upgrade request modal", () => {
  it("sends the chosen higher limit and message, with no price shown", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(createElement(ProductLimitModal, {
      productCount: 3, productLimit: 3, latestRequest: null, onClose: vi.fn(), onSubmit,
    }));
    fireEvent.click(screen.getByText('seller.plan.productsOption {"count":10}'));
    fireEvent.change(container.querySelector("textarea")!, { target: { value: "More SKUs" } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(10, "More SKUs"));
    expect(await screen.findByText("seller.plan.sent")).toBeTruthy();
    expect(container.textContent).not.toMatch(/[$₹¥]|\bprice\b/i);
  });

  it("rejects a custom limit that is not higher than the current one", async () => {
    const onSubmit = vi.fn();
    const { container } = render(createElement(ProductLimitModal, {
      productCount: 3, productLimit: 3, latestRequest: null, onClose: vi.fn(), onSubmit,
    }));
    fireEvent.click(screen.getByText("seller.plan.custom"));
    fireEvent.change(container.querySelector('input[type="number"]')!, { target: { value: "2" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText(/seller\.plan\.mustExceed/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a pending request instead of a second form", () => {
    render(createElement(ProductLimitModal, {
      productCount: 3, productLimit: 3, onClose: vi.fn(), onSubmit: vi.fn(),
      latestRequest: { id: "r", currentCount: 3, currentLimit: 3, requestedLimit: 10, status: "PENDING", createdAt: "2026-11-15T00:00:00Z" },
    }));
    expect(screen.getByText(/seller\.plan\.pending/)).toBeTruthy();
    expect(document.querySelector("form")).toBeNull();
  });

  it("surfaces backend errors", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("You already have a pending request."));
    const { container } = render(createElement(ProductLimitModal, {
      productCount: 3, productLimit: 3, latestRequest: null, onClose: vi.fn(), onSubmit,
    }));
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("You already have a pending request.")).toBeTruthy();
  });
});

describe("manufacturer profile video", () => {
  it("validates type and size", () => {
    expect(isAcceptedProfileVideo({ type: "video/mp4", size: 1024 })).toBe(true);
    expect(isAcceptedProfileVideo({ type: "video/quicktime", size: 100 * 1024 * 1024 })).toBe(true);
    expect(isAcceptedProfileVideo({ type: "video/mp4", size: 100 * 1024 * 1024 + 1 })).toBe(false);
    expect(isAcceptedProfileVideo({ type: "image/png", size: 10 })).toBe(false);
    expect(isAcceptedProfileVideo({ type: "video/x-msvideo", size: 10 })).toBe(false);
  });

  it("uploads through the secure media endpoint as a video and saves the URL", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(createElement(ProfileVideoSection, { onSave }));
    fireEvent.change(screen.getByTestId("profile-video-input"), {
      target: { files: [new File(["v"], "tour.mp4", { type: "video/mp4" })] },
    });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("/api/v1/media/uploaded.mp4"));
    expect(uploadMedia).toHaveBeenCalledWith(expect.any(File), "video", expect.any(Function));
  });

  it("refuses a non-video file without uploading", () => {
    const onSave = vi.fn();
    render(createElement(ProfileVideoSection, { onSave }));
    fireEvent.change(screen.getByTestId("profile-video-input"), {
      target: { files: [new File(["x"], "doc.pdf", { type: "application/pdf" })] },
    });
    expect(screen.getByText("seller.profile.profileVideoInvalid")).toBeTruthy();
    expect(uploadMedia).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("removes the video by saving an empty URL", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(createElement(ProfileVideoSection, { videoUrl: "/api/v1/media/x.mp4", onSave }));
    fireEvent.click(screen.getByText("seller.profile.removeProfileVideo"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(""));
  });
});
