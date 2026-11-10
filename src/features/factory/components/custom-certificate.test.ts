// @vitest-environment jsdom
import { createElement as h } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "../../../../messages/en.json";
import zh from "../../../../messages/zh.json";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { isPdfDocument } from "@/entities/factory-certificate";

const uploadMedia = vi.fn();
vi.mock("@/shared/api", () => ({ getApi: () => ({ factory: { uploadMedia } }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => {
  let value: unknown = en;
  for (const part of key.split(".")) value = (value as Record<string, unknown>)[part];
  if (typeof value !== "string") throw new Error(`Missing translation: ${key}`);
  return value;
} }));

const { UploadCertificateModal, customDocumentError } = await import("./upload-certificate-modal");
const { AlibabaCertSection } = await import("@/components/profile/alibaba-cert-section");

afterEach(() => {
  cleanup();
  uploadMedia.mockReset();
});

function openCustom() {
  const onAdd = vi.fn();
  render(h(UploadCertificateModal, { isOpen: true, onClose: vi.fn(), onAddCertificate: onAdd }));
  fireEvent.click(screen.getByRole("radio", { name: /Add custom certificate/ }));
  return onAdd;
}

describe("custom certificates", () => {
  it("uploads the document as kind=document and saves an unverified custom certificate", async () => {
    uploadMedia.mockResolvedValue({ url: "/api/v1/media/0b5e7d1c-2f4a-4c1e-9a3b-7d6e5f4a3b2c.pdf" });
    const onAdd = openCustom();

    fireEvent.change(screen.getByLabelText("Exact certificate name"), { target: { value: "ISO 13485:2016" } });
    const file = new File(["%PDF-1.4"], "iso-13485.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Upload certificate document"), { target: { files: [file] } });
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith(file, "document"));
    await screen.findAllByText("iso-13485.pdf");

    fireEvent.submit(screen.getByLabelText("Exact certificate name").closest("form")!);
    expect(onAdd).toHaveBeenCalledTimes(1);
    const saved: FactoryCertificate = onAdd.mock.calls[0][0];
    expect(saved).toMatchObject({
      title: "ISO 13485:2016",
      issuer: "",
      custom: true,
      verified: false,
      documentName: "iso-13485.pdf",
      imageUrl: "/api/v1/media/0b5e7d1c-2f4a-4c1e-9a3b-7d6e5f4a3b2c.pdf",
    });
  });

  it("requires a name and a document", async () => {
    const onAdd = openCustom();
    const form = screen.getByLabelText("Exact certificate name").closest("form")!;
    fireEvent.submit(form);
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Enter the exact certificate name.");
    fireEvent.change(screen.getByLabelText("Exact certificate name"), { target: { value: "ISO 13485:2016" } });
    fireEvent.submit(form);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("rejects unsupported or oversized files before uploading", async () => {
    openCustom();
    const exe = new File(["x"], "cert.exe", { type: "application/octet-stream" });
    fireEvent.change(screen.getByLabelText("Upload certificate document"), { target: { files: [exe] } });
    expect((await screen.findByRole("alert")).textContent).toBe("Upload a PDF, PNG, JPG or WebP file.");
    expect(uploadMedia).not.toHaveBeenCalled();

    expect(customDocumentError({ name: "a.pdf", type: "application/pdf", size: 21 * 1024 * 1024 })).toBe("size");
    expect(customDocumentError({ name: "a.PDF", type: "application/pdf", size: 10 })).toBeNull();
    expect(customDocumentError({ name: "scan.jpg", type: "image/jpeg", size: 10 })).toBeNull();
    expect(customDocumentError({ name: "a.pdf", type: "text/html", size: 10 })).toBe("type");
  });

  it("keeps the standard flow requiring an issuer and image upload", async () => {
    uploadMedia.mockResolvedValue({ url: "/api/v1/media/x.png" });
    const onAdd = vi.fn();
    render(h(UploadCertificateModal, { isOpen: true, onClose: vi.fn(), onAddCertificate: onAdd }));
    const file = new File(["png"], "iso.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload Certificate Image"), { target: { files: [file] } });
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith(file, "image"));
  });

  it("shows PDFs as a document tile and labels custom certificates as company-provided", () => {
    const cert: FactoryCertificate = {
      id: "c1", title: "ISO 13485:2016", issuer: "", certNumber: "", verified: false, custom: true,
      documentName: "iso-13485.pdf", imageUrl: "/api/v1/media/0b5e7d1c-2f4a-4c1e-9a3b-7d6e5f4a3b2c.pdf", category: "Quality",
    };
    render(h(AlibabaCertSection, { certificates: [cert], manufacturer: { name: "F", yearsEstablished: 0, factorySize: "", verified: false } }));
    expect(screen.getByRole("img", { name: "ISO 13485:2016" }).tagName).toBe("DIV");
    expect(screen.getByText("iso-13485.pdf")).toBeTruthy();
    expect(screen.getByText(/Unverified document · Company-provided/)).toBeTruthy();
    expect(screen.queryByText("Verified by SeekFactory")).toBeNull();
  });

  it("detects PDF documents by path", () => {
    expect(isPdfDocument("/api/v1/media/a.pdf")).toBe(true);
    expect(isPdfDocument("https://cdn.x/a.PDF?sig=1")).toBe(true);
    expect(isPdfDocument("/api/v1/media/a.png")).toBe(false);
    expect(isPdfDocument(undefined)).toBe(false);
  });

  it("has every new label in both locales", () => {
    for (const messages of [en, zh]) {
      expect(messages.seller.cert.addCustomCertificate.length).toBeGreaterThan(0);
      expect(messages.seller.cert.customCertificateNote.length).toBeGreaterThan(0);
      expect(messages.profile.certs.companyProvided.length).toBeGreaterThan(0);
      expect(messages.seller.product.maxPriceOptional.length).toBeGreaterThan(0);
      expect(messages.seller.errors.maxPriceBelowMin.length).toBeGreaterThan(0);
    }
  });
});
