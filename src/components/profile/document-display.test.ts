// @vitest-environment jsdom
import { createElement as h } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CertificateLightboxModal } from "./certificate-lightbox-modal";
import { AlibabaCertSection } from "./alibaba-cert-section";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import en from "../../../messages/en.json";
import zh from "../../../messages/zh.json";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => {
  let value: unknown = en;
  for (const part of key.split(".")) value = (value as Record<string, unknown>)[part];
  if (typeof value !== "string") throw new Error(`Missing translation: ${key}`);
  return value;
} }));
afterEach(cleanup);
const cert: FactoryCertificate = { id: "imported", title: "ISO 9001", issuer: "Registrar", certNumber: "123", imageUrl: "/original.webp", verified: false, category: "Quality" };
const manufacturer = { name: "Factory", yearsEstablished: 0, factorySize: "", verified: true };

describe("manufacturer document display", () => {
  it("labels an imported certificate unverified and keeps the original link", () => {
    render(h(CertificateLightboxModal, { certificate: cert, onClose: vi.fn() }));
    expect(screen.getAllByText("Unverified document")).toHaveLength(2);
    expect(screen.queryByText("Verified by SeekFactory")).toBeNull();
    expect(screen.getByText(/has not been verified by SeekFactory/)).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(cert.imageUrl);
    expect(document.querySelectorAll(".lucide-award, .lucide-shield-check")).toHaveLength(0);
  });
  it("preserves explicitly verified documents without inventing an on-site guarantee", () => {
    render(h(CertificateLightboxModal, { certificate: { ...cert, verified: true }, onClose: vi.fn() }));
    expect(screen.getAllByText("Verified by SeekFactory")).toHaveLength(2);
    expect(screen.getByText(/This document has been reviewed/)).toBeTruthy();
    expect(screen.queryByText("On-Site Factory Compliance Guarantee")).toBeNull();
    expect(document.querySelectorAll(".lucide-award")).toHaveLength(1);
  });
  it.each([undefined, null, "true"])("does not treat runtime verification value %s as approval", (verified) => {
    render(h(CertificateLightboxModal, { certificate: { ...cert, verified } as unknown as FactoryCertificate, onClose: vi.fn() }));
    expect(screen.queryByText("Verified by SeekFactory")).toBeNull();
    expect(screen.getAllByText("Unverified document")).toHaveLength(2);
  });
  it("handles missing imported metadata without fabricated credentials", () => {
    render(h(CertificateLightboxModal, { certificate: { ...cert, title: " ", issuer: null, certNumber: undefined, category: undefined } as unknown as FactoryCertificate, onClose: vi.fn() }));
    expect(screen.getByRole("heading", { name: "Document" })).toBeTruthy();
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
  });
  it("separates business registration, quality certification and unknown documents", () => {
    const documents: FactoryCertificate[] = [cert, { ...cert, id: "business", title: "Business license", category: "Business Registration" }, { ...cert, id: "unknown", title: "Imported scan", category: undefined }];
    const inspect = vi.fn();
    render(h(AlibabaCertSection, { certificates: documents, manufacturer, onInspect: inspect }));
    for (const [label, title] of [["Business registration documents", "Business license"], ["Certifications", "ISO 9001"], ["Other documents", "Imported scan"]]) {
      const row = screen.getByText(label).parentElement!;
      expect(within(row).getByText(title)).toBeTruthy();
      expect(within(row).getByText("Unverified document")).toBeTruthy();
    }
    fireEvent.click(screen.getByText("Business license"));
    expect(inspect).toHaveBeenCalledWith(documents[1]);
    // The manufacturer's approval never confers approval on its individual documents.
    expect(screen.getAllByText("Verified by SeekFactory")).toHaveLength(1);
  });
  it("retains card inspection and deletion for owner documents", () => {
    const onDeleteCertificate = vi.fn();
    const onInspect = vi.fn();
    render(h(AlibabaCertSection, { certificates: [cert], manufacturer, isOwner: true, onDeleteCertificate, onInspect }));
    fireEvent.click(screen.getByTitle("Delete Certificate"));
    expect(onDeleteCertificate).toHaveBeenCalledWith(cert.id);
    expect(onInspect).not.toHaveBeenCalled();
  });
  it("provides both locale strings for every added display label", () => {
    for (const messages of [en, zh]) {
      expect(messages.profile.certs.businessDocuments.length).toBeGreaterThan(0);
      expect(messages.profile.certs.otherDocuments.length).toBeGreaterThan(0);
      expect(messages.profile.certModal.unverifiedDocument.length).toBeGreaterThan(0);
      expect(messages.profile.certModal.documentNotVerified.length).toBeGreaterThan(0);
    }
  });
});
