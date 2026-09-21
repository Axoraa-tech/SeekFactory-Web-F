"use client";

import { Building2, Search, Edit2 } from "lucide-react";

const mockFactories = [
  { id: "1", name: "Shenzhen Precision CNC", tier: "Free Tier", status: "Verified" },
  { id: "2", name: "Guangzhou Textiles Ltd.", tier: "Pro Tier", status: "Verified" },
  { id: "3", name: "Global Electronics Mfg", tier: "Enterprise Tier", status: "Verified" },
];

export default function PricingConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing Configuration</h2>
          <p className="text-slate-500 mt-1">Manage manufacturer subscription tiers and billing.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search manufacturers..."
              className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Manufacturer</th>
              <th className="px-6 py-4 font-medium">Current Tier</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {mockFactories.map((factory) => (
              <tr key={factory.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-900">{factory.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    factory.tier === "Enterprise Tier" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                    factory.tier === "Pro Tier" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {factory.tier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {factory.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
