// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddProductModal } from "./add-product-modal";
import type { SellerProduct } from "../types";
import type { Category } from "@/entities/category";

const uploadMedia = vi.hoisted(() => vi.fn().mockResolvedValue({ url: "/uploaded.png" }));
vi.mock("@/shared/api", () => ({ getApi: () => ({ factory: { uploadMedia } }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

const categories: Category[] = [{ id: "c1", slug: "machinery", name: "Machinery", parentId: null, listingCount: 1, icon: "machine-tools" }];
const existing: SellerProduct = {
  id: "p1", name: "Lathe", slug: "lathe", imageUrl: "/cover.png", imageUrls: ["/cover.png"],
  category: "Machinery", categoryId: "c1", priceInr: 100, unit: "Set", moq: "1 Set",
  status: "Active", stockStatus: "IN_STOCK", viewsCount: 0, inquiriesCount: 0,
  specs: { Voltage: "220 V" }, description: "Manufacturer supplied description", createdAt: "Today",
};
const nameLabel = "seller.product.specNameEGSpindle";
const valueLabel = "seller.product.specValueEG12";

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

function setup(product?: SellerProduct) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  const view = render(createElement(AddProductModal, { isOpen: true, categories, product, onSubmit, onClose }));
  return { ...view, onSubmit, onClose };
}

function fillRequiredCreateFields(container: HTMLElement) {
  fireEvent.change(container.querySelector('input[required]')!, { target: { value: "Lathe" } });
  fireEvent.change(screen.getByLabelText("seller.product.minPrice"), { target: { value: "100" } });
  fireEvent.change(container.querySelector('input[type="file"][multiple]')!, {
    target: { files: [new File(["image"], "machine.png", { type: "image/png" })] },
  });
}

describe("manufacturer-authored product specifications", () => {
  it("starts with blank values, never the example machine or certification claims", () => {
    const { container } = setup();
    expect((screen.getByLabelText(nameLabel) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(valueLabel) as HTMLInputElement).value).toBe("");
    const values = Array.from(container.querySelectorAll("input")).map((input) => input.value).join(" ");
    expect(values).not.toMatch(/12,000|1200 x 600|ISO 9001|CE/);
  });

  it("saves an untouched specification section as empty and invents no description", async () => {
    const { container, onSubmit } = setup();
    fillRequiredCreateFields(container);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ specs: {}, description: "" });
  });

  it("saves only entered, trimmed complete pairs and preserves the author's description", async () => {
    const { container, onSubmit } = setup();
    fillRequiredCreateFields(container);
    fireEvent.change(screen.getByLabelText(nameLabel), { target: { value: " Voltage " } });
    fireEvent.change(screen.getByLabelText(valueLabel), { target: { value: " 220 V " } });
    fireEvent.click(screen.getByText("seller.product.addSpecification"));
    fireEvent.change(screen.getAllByLabelText(nameLabel)[1], { target: { value: " " } });
    fireEvent.change(container.querySelector("textarea")!, { target: { value: " Seller description " } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ specs: { Voltage: "220 V" }, description: "Seller description" });
  });

  it("preserves stored specifications when editing and does not insert samples for empty products", async () => {
    const { container, onSubmit, unmount } = setup(existing);
    expect((screen.getByLabelText(valueLabel) as HTMLInputElement).value).toBe("220 V");
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ specs: existing.specs, description: existing.description });
    unmount();
    setup({ ...existing, specs: {} });
    expect((screen.getByLabelText(valueLabel) as HTMLInputElement).value).toBe("");
  });

  it("allows clearing all saved specifications without reintroducing defaults", async () => {
    const { container, onSubmit } = setup(existing);
    fireEvent.change(screen.getByLabelText(nameLabel), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(valueLabel), { target: { value: "" } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].specs).toEqual({});
  });

  it("opens another new product with empty fields after cancelling", () => {
    const { unmount, onClose } = setup();
    fireEvent.change(screen.getByLabelText(valueLabel), { target: { value: "Do not retain" } });
    fireEvent.click(screen.getByLabelText("common.close"));
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    setup();
    expect((screen.getByLabelText(valueLabel) as HTMLInputElement).value).toBe("");
  });
});

describe("optional product video", () => {
  function selectVideo(container: HTMLElement, file = new File(["video"], "demo.mp4", { type: "video/mp4" })) {
    fireEvent.change(container.querySelector('#product-video')!, { target: { files: [file] } });
    return file;
  }

  it("creates a photo-only product without a video", async () => {
    const { container, onSubmit } = setup();
    fillRequiredCreateFields(container);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].videoUrl).toBeUndefined();
  });

  it("uploads exactly one video and previews it; releases the preview on unmount", async () => {
    const { container, onSubmit, unmount } = setup(existing);
    const file = selectVideo(container);
    expect(container.querySelector("video")?.getAttribute("src")).toBe("blob:preview");
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(uploadMedia).toHaveBeenCalledWith(file, "video");
    expect(onSubmit.mock.calls[0][0].videoUrl).toBe("/uploaded.png");
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it.each([
    { initialVideo: undefined, latestVideo: "/added-elsewhere.mp4" },
    { initialVideo: "/old.mp4", latestVideo: "/replaced-elsewhere.mp4" },
    { initialVideo: "/old.mp4", latestVideo: undefined },
  ])("does not overwrite another session's video on an unrelated stale edit: $initialVideo -> $latestVideo", async ({ initialVideo, latestVideo }) => {
    const { container, onSubmit } = setup({ ...existing, videoUrl: initialVideo });
    // Another session changes the stored video after this edit form has opened.
    let storedVideo = latestVideo;
    onSubmit.mockImplementation(async (input) => {
      // Match the backend update contract: omitted = preserve, blank = clear.
      if (input.videoUrl !== undefined) storedVideo = input.videoUrl || undefined;
    });
    fireEvent.change(container.querySelector("textarea")!, { target: { value: "Updated description" } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].description).toBe("Updated description");
    expect(JSON.parse(JSON.stringify(onSubmit.mock.calls[0][0]))).not.toHaveProperty("videoUrl");
    expect(storedVideo).toBe(latestVideo);
    expect(uploadMedia).not.toHaveBeenCalled();
  });

  it("does not mark video changed when the picker is cancelled or rejects a file", async () => {
    const { container, onSubmit } = setup({ ...existing, videoUrl: "/existing.mp4" });
    fireEvent.change(container.querySelector<HTMLInputElement>("#product-video")!, { target: { files: [] } });
    selectVideo(container, new File(["x"], "bad.pdf", { type: "application/pdf" }));
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].videoUrl).toBeUndefined();
    expect(uploadMedia).not.toHaveBeenCalled();
  });

  it("preserves the existing video without upload, and explicitly clears when removed", async () => {
    const first = setup({ ...existing, videoUrl: "/existing.mp4" });
    fireEvent.submit(first.container.querySelector("form")!);
    await waitFor(() => expect(first.onSubmit).toHaveBeenCalledOnce());
    expect(first.onSubmit.mock.calls[0][0].videoUrl).toBeUndefined();
    expect(uploadMedia).not.toHaveBeenCalled();
    first.unmount();
    const second = setup({ ...existing, videoUrl: "/existing.mp4" });
    fireEvent.click(screen.getByText("seller.product.removeVideo"));
    expect(second.container.querySelector("video")).toBeNull();
    fireEvent.submit(second.container.querySelector("form")!);
    await waitFor(() => expect(second.onSubmit).toHaveBeenCalledOnce());
    expect(second.onSubmit.mock.calls[0][0].videoUrl).toBe("");
  });

  it("rejects invalid type and oversized video without losing the existing selection", () => {
    const { container } = setup({ ...existing, videoUrl: "/existing.mp4" });
    selectVideo(container, new File(["x"], "bad.pdf", { type: "application/pdf" }));
    expect(screen.getByRole("alert").textContent).toBe("seller.product.videoTypeError");
    const large = new File(["x"], "large.mp4", { type: "video/mp4" });
    Object.defineProperty(large, "size", { value: 100 * 1024 * 1024 + 1 });
    selectVideo(container, large);
    expect(screen.getByRole("alert").textContent).toBe("seller.product.videoSizeError");
    expect(container.querySelector("video")?.getAttribute("src")).toBe("/existing.mp4");
    expect(uploadMedia).not.toHaveBeenCalled();
  });

  it("replaces the video, releases removed previews and accepts the 100 MB boundary", () => {
    const { container } = setup();
    selectVideo(container);
    const second = new File(["x"], "replacement.mov", { type: "video/quicktime" });
    Object.defineProperty(second, "size", { value: 100 * 1024 * 1024 });
    selectVideo(container, second);
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText("seller.product.removeVideo"));
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("locks the form, ignores repeated submit, and reuses an uploaded video after save fails", async () => {
    const { container, onSubmit, onClose } = setup(existing);
    selectVideo(container);
    let rejectSave!: (error: Error) => void;
    onSubmit.mockImplementationOnce(() => new Promise((_, reject) => { rejectSave = reject; }));
    fireEvent.submit(container.querySelector("form")!);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(container.querySelector("fieldset")?.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("common.close"));
    expect(onClose).not.toHaveBeenCalled();
    rejectSave(new Error("Save failed"));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Save failed"));
    expect(container.querySelector("fieldset")?.disabled).toBe(false);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(uploadMedia).toHaveBeenCalledOnce();
  });

  it("allows retry after a failed upload without saving a broken video", async () => {
    const { container, onSubmit } = setup(existing);
    selectVideo(container);
    uploadMedia.mockRejectedValueOnce(new Error("Upload failed"));
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Upload failed"));
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(uploadMedia).toHaveBeenCalledTimes(2);
  });
});

describe("explicit price range updates", () => {
  it.each([["", null], ["100", null], ["300", 300]])("serializes edited max %s without losing explicit clearing", async (value, expected) => {
    const { container, onSubmit } = setup({ ...existing, priceMaxInr: 250 });
    fireEvent.change(screen.getByLabelText("seller.product.maxPriceOptional"), { target: { value } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(JSON.parse(JSON.stringify(onSubmit.mock.calls[0][0])).priceMaxInr).toBe(expected);
  });
  it("retains an existing range during an unrelated save", async () => {
    const { container, onSubmit } = setup({ ...existing, priceMaxInr: 250 });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].priceMaxInr).toBe(250);
  });
});
