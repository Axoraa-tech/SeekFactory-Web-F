import type { ReactNode } from "react";

export const metadata = {
  title: "Seller Hub & Manufacturer Center | SeekFactory",
  description: "Manage your industrial factory profile, machinery products, video seeks, and buyer RFQs.",
};

export default function FactoryLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
}
