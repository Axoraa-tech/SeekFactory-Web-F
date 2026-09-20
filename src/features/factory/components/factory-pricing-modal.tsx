"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Award,
  Crown,
  Building2,
  PhoneCall,
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe2,
  Users,
  Briefcase,
  CheckCircle2,
  Minus,
  Star,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type FactoryPlanTier =
  | "basic"
  | "premium"
  | "vip_partner"
  | "strategic_vip";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
  onSelectPlan: (tier: FactoryPlanTier, tierName: string) => void;
};

export function FactoryPricingModal({
  isOpen,
  onClose,
  currentTier = "basic",
  onSelectPlan,
}: Props) {
  const [activeView, setActiveView] = useState<"cards" | "matrix">("cards");
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [selectedPlanFeedback, setSelectedPlanFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const tiers = [
    {
      id: "basic" as FactoryPlanTier,
      title: "BASIC LISTING",
      titleCn: "免费版",
      badge: "Free Starter",
      price: "$0",
      period: "Year 1 (First 500)",
      priceDetail: "Then $300/yr ($300/yr from 501st)",
      priceDetailCn: "前 500 家首年免费，次年起 $300/年",
      popular: false,
      strategic: false,
      accentColor: "border-slate-200 bg-white",
      btnClass: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300",
      features: [
        "Company Listing on Website (网站展示)",
        "3 Video Listings (3 支视频上传)",
        "3 Product Listings (3 款产品展示)",
        "Basic Profile Page (企业基础页面)",
        "Company Logo Display (Logo 展示)",
        "Embedded Link CTA Only (仅嵌入链接)",
        "Standard Public Display",
      ],
      notIncluded: [
        "Factory Verification Badge",
        "Public Phone / WhatsApp / Email",
        "Direct Buyer Enquiries",
        "Social Media Promotion",
        "Buyer RFQ Access",
      ],
    },
    {
      id: "premium" as FactoryPlanTier,
      title: "PREMIUM",
      titleCn: "商务版",
      badge: "Verified Supplier",
      price: "USD 1,000",
      period: "/ Year (年费)",
      priceDetail: "Direct Lead Matchmaking & RFQ Access",
      priceDetailCn: "包含工厂认证与买家直接询盘",
      popular: false,
      strategic: false,
      accentColor: "border-blue-200 bg-blue-50/20",
      btnClass: "bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm",
      features: [
        "Factory Verification Badge (工厂认证标识)",
        "20 Video Listings (20 支视频上传)",
        "20 Product Listings (20 款产品展示)",
        "Standard Profile Page (专属标准页面)",
        "Public Phone, Email & WhatsApp/WeChat",
        "Direct Buyer Enquiries (买家直接询盘)",
        "Call-to-Action Contact Buttons",
        "Monthly Social Media Promotion (月度推广)",
        "Access to Buyer RFQs (买家采购需求)",
        "Limited Buyer Lead Matching (买家匹配)",
      ],
      notIncluded: [
        "Introduction to Purchasing Managers",
        "Dedicated Account Manager",
        "Trade Mission Invitations",
      ],
    },
    {
      id: "vip_partner" as FactoryPlanTier,
      title: "VIP GLOBAL PARTNER",
      titleCn: "全球 VIP 版",
      badge: "Most Popular • 全球热选",
      price: "USD 10,000",
      period: "/ Year (年费)",
      priceDetail: "Full Direct Decision-Maker Access",
      priceDetailCn: "无限展示 + 专属客户经理 + 商务考察",
      popular: true,
      strategic: false,
      accentColor: "border-[#F26B21] bg-orange-50/20 ring-2 ring-[#F26B21]/30",
      btnClass: "bg-[#F26B21] hover:bg-[#E05307] text-white shadow-sm",
      features: [
        "VIP Verified Badge (VIP 认证标识)",
        "Unlimited Videos & Products (无限视频与产品)",
        "Premium Profile Page (高级企业专属页面)",
        "Homepage Featured Exposure (首页重点展示)",
        "Weekly Social Media Promotion (每周社媒推广)",
        "Full Buyer Lead Matching (买家匹配服务)",
        "Direct Purchasing Manager Introductions (对接采购经理)",
        "Dedicated Account Manager (专属客户经理)",
        "Quarterly Business Consultation (每季度商务咨询)",
        "International Business Matching (国际商务配对)",
        "Trade Mission Invitations (商务考察邀请)",
      ],
      notIncluded: [
        "Strategic Partnership Status",
      ],
    },
    {
      id: "strategic_vip" as FactoryPlanTier,
      title: "STRATEGIC GLOBAL VIP",
      titleCn: "战略全球 VIP 版",
      badge: "Enterprise Exclusive • 顶级战略",
      price: "USD 20,000",
      period: "/ Year (年费)",
      priceDetail: "Direct High-Level Network",
      priceDetailCn: "海外采购企业直接对接 + 行业独家推荐",
      popular: false,
      strategic: true,
      accentColor: "border-slate-800 bg-slate-50 ring-2 ring-slate-800",
      btnClass: "bg-slate-800 hover:bg-slate-900 text-white shadow-sm",
      features: [
        "Strategic Verified Badge (战略最高认证)",
        "Unlimited Listings with Priority Placement",
        "Top Priority Homepage Exposure (首页顶级展示)",
        "Dedicated Marketing Campaigns (专属营销活动)",
        "Priority Direct Access to Foreign Buyers (对接海外采购企业)",
        "Senior Account Manager (高级专属维护)",
        "Unlimited Business Consultation (无限次商务咨询)",
        "Government & Institutional Project Access (政府及机构项目机会)",
        "Strategic Partnership Status (战略合作伙伴身份)",
        "Exclusive Industry Positioning (行业独家推荐)",
        "Customized Global Expansion Support (全球市场拓展支持)",
      ],
      notIncluded: [],
    },
  ];

  // Full 29 features comparison matrix from PDF
  const matrixFeatures = [
    {
      category: "Display & Branding (展示与品牌)",
      items: [
        { name: "Company Listing on Website (网站企业展示)", basic: "Yes", premium: "Yes", vip: "Yes", strategic: "Yes" },
        { name: "Factory Verification Badge (工厂认证标识)", basic: "No", premium: "Yes", vip: "VIP Verified", strategic: "Strategic Verified" },
        { name: "Maximum Video Listings (视频上传数量)", basic: "3 Videos", premium: "20 Videos", vip: "Unlimited", strategic: "Unlimited" },
        { name: "Maximum Product Listings (产品展示数量)", basic: "3 Products", premium: "20 Products", vip: "Unlimited", strategic: "Unlimited" },
        { name: "Company Profile Page (企业专属页面)", basic: "Basic", premium: "Standard", vip: "Premium", strategic: "Executive Premium" },
        { name: "Company Logo Display (企业 Logo 展示)", basic: "Yes", premium: "Yes", vip: "Yes", strategic: "Priority Placement" },
        { name: "Public Company Name Display (企业名称公开展示)", basic: "Yes", premium: "Yes", vip: "Yes", strategic: "Yes" },
        { name: "Public Phone Number Display (企业电话公开展示)", basic: "No", premium: "Yes", vip: "Yes", strategic: "Yes" },
        { name: "Public Email Display (企业邮箱公开展示)", basic: "No", premium: "Yes", vip: "Yes", strategic: "Yes" },
        { name: "WhatsApp / WeChat Display (微信/WhatsApp 展示)", basic: "No", premium: "Yes", vip: "Yes", strategic: "Yes" },
        { name: "Call-To-Action Buttons (联系按钮)", basic: "Embedded Link Only", premium: "Yes", vip: "Yes", strategic: "Priority" },
        { name: "Homepage Exposure (首页展示)", basic: "No", premium: "No", vip: "Featured", strategic: "Top Priority" },
        { name: "Priority Search Ranking (优先搜索排名)", basic: "No", premium: "Standard", vip: "High", strategic: "Top Priority" },
      ],
    },
    {
      category: "Buyer Leads & Sourcing (买家与采购对接)",
      items: [
        { name: "Direct Buyer Enquiries (买家直接询盘)", basic: "No", premium: "Yes", vip: "Yes", strategic: "Priority" },
        { name: "Buyer Lead Matching (买家匹配服务)", basic: "No", premium: "Limited", vip: "Yes", strategic: "Priority" },
        { name: "Access to Buyer RFQs (买家采购需求)", basic: "No", premium: "Yes", vip: "Yes", strategic: "Priority Access" },
        { name: "Participation in Sourcing Projects (采购项目参与)", basic: "No", premium: "Limited", vip: "Yes", strategic: "Priority" },
        { name: "Introduction to Purchasing Managers (对接采购经理)", basic: "No", premium: "No", vip: "Yes", strategic: "Priority" },
        { name: "Introduction to Senior Management (对接高管)", basic: "No", premium: "No", vip: "Limited", strategic: "Yes" },
        { name: "Access to Foreign Buyer Executives (对接海外采购企业高管)", basic: "None", premium: "None", vip: "Limited Access", strategic: "Priority Access" },
      ],
    },
    {
      category: "Promotion & Executive Networking (推广与高管网络)",
      items: [
        { name: "Social Media Promotion (社交媒体推广)", basic: "No", premium: "Monthly", vip: "Weekly", strategic: "Dedicated Campaigns" },
        { name: "Dedicated Account Manager (专属客户经理)", basic: "No", premium: "No", vip: "Yes", strategic: "Senior Account Manager" },
        { name: "Business Consultation (商务咨询服务)", basic: "No", premium: "No", vip: "Quarterly", strategic: "Unlimited" },
        { name: "International Business Matching (国际商务配对)", basic: "No", premium: "No", vip: "Yes", strategic: "Priority" },
        { name: "Trade Mission Invitations (商务考察邀请)", basic: "No", premium: "No", vip: "Yes", strategic: "VIP Priority" },
        { name: "Government & Institutional Project Access (政府及机构项目机会)", basic: "No", premium: "No", vip: "Limited", strategic: "Priority" },
        { name: "Strategic Partnership Status (战略合作伙伴身份)", basic: "No", premium: "No", vip: "No", strategic: "Yes" },
        { name: "Brand Promotion Support (品牌推广支持)", basic: "No", premium: "Limited", vip: "Advanced", strategic: "Full Support" },
        { name: "Exclusive Industry Positioning (行业独家推荐)", basic: "No", premium: "No", vip: "No", strategic: "Yes" },
        { name: "Customized Global Expansion Support (全球市场拓展支持)", basic: "No", premium: "No", vip: "No", strategic: "Yes" },
        { name: "Mobile App Listing APP 企业展示", basic: "Future Release", premium: "Future Release", vip: "Future Release", strategic: "Future Release" },
      ],
    },
  ];

  const handleSelect = (tierId: FactoryPlanTier, title: string) => {
    setSelectedPlanFeedback(`Selected ${title}! Updating factory membership status...`);
    setTimeout(() => {
      onSelectPlan(tierId, title);
      setSelectedPlanFeedback(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl flex flex-col my-auto">
        {/* Top Header Banner */}
        <div className="relative bg-slate-900 px-6 py-6 sm:px-8 sm:py-7 text-white shrink-0 border-b border-white/10">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="max-w-3xl space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              全球企业会员方案 • Global Enterprise Membership Plans
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect Factory Owners and Management directly with International Buyers, Importers, and Decision-Makers. Remove unnecessary middlemen and close deals directly.
            </p>
          </div>

          {/* Tab Switcher: Plan Cards vs Full Matrix Table */}
          <div className="flex items-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveView("cards")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                activeView === "cards"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Plan Overview (方案总览)
            </button>
            <button
              type="button"
              onClick={() => setActiveView("matrix")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                activeView === "matrix"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Complete 29-Feature Comparison Matrix (全部功能对比表)
            </button>
          </div>
        </div>

        {/* Feedback alert if plan selected */}
        {selectedPlanFeedback && (
          <div className="bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{selectedPlanFeedback}</span>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* VIEW 1: 4 TIER PLAN CARDS */}
          {activeView === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((t) => {
                const isSelected = currentTier.toLowerCase().includes(t.id);

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg",
                      t.accentColor
                    )}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
                          t.strategic
                            ? "bg-purple-600 text-white"
                            : t.popular
                            ? "bg-[#F26B21] text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        {t.badge}
                      </span>
                      {t.strategic && <Crown className="h-4 w-4 text-amber-500" />}
                      {t.popular && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-1 pb-4 border-b border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {t.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">{t.titleCn}</p>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {t.price}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{t.period}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.priceDetail}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.priceDetailCn}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="py-4">
                      <button
                        type="button"
                        onClick={() => handleSelect(t.id, t.title)}
                        className={cn(
                          "w-full py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer",
                          t.btnClass
                        )}
                      >
                        {isSelected ? "Current Plan (当前方案)" : `Choose ${t.title}`}
                      </button>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 flex-1 pt-2">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Key Inclusions:
                      </p>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {t.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-snug">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {t.notIncluded.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 mt-3">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Not Included:
                          </p>
                          <ul className="space-y-1.5 text-[11px] text-slate-400">
                            {t.notIncluded.map((nf, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <Minus className="h-3 w-3 text-slate-300 shrink-0" />
                                <span>{nf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: COMPLETE 29-FEATURE MATRIX */}
          {activeView === "matrix" && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="py-3.5 px-4 font-bold text-xs min-w-[240px]">
                        Features & Services 功能项目
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center min-w-[120px]">
                        BASIC LISTING
                        <span className="block text-[10px] text-slate-300 font-normal">免费版</span>
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center min-w-[140px] bg-blue-900/60">
                        PREMIUM
                        <span className="block text-[10px] text-blue-200 font-normal">USD 1,000 / Yr</span>
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center min-w-[150px] bg-amber-900/60">
                        VIP GLOBAL PARTNER
                        <span className="block text-[10px] text-amber-200 font-normal">USD 10,000 / Yr</span>
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center min-w-[160px] bg-purple-950">
                        STRATEGIC VIP
                        <span className="block text-[10px] text-purple-200 font-normal">USD 20,000 / Yr</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixFeatures.map((cat, catIdx) => (
                      <React.Fragment key={catIdx}>
                        <tr className="bg-slate-100/80 border-y border-slate-200">
                          <td colSpan={5} className="py-2 px-4 font-bold text-[11px] text-slate-800 uppercase tracking-wider">
                            {cat.category}
                          </td>
                        </tr>
                        {cat.items.map((item, itemIdx) => (
                          <tr
                            key={itemIdx}
                            className="border-b border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="py-2.5 px-4 font-medium text-slate-800">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                              {item.basic === "Yes" ? (
                                <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                              ) : item.basic === "No" ? (
                                <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                              ) : (
                                item.basic
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-700 font-semibold bg-blue-50/30">
                              {item.premium === "Yes" ? (
                                <Check className="h-4 w-4 text-brand-blue mx-auto" />
                              ) : item.premium === "No" ? (
                                <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                              ) : (
                                item.premium
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-[#F26B21] font-bold bg-orange-50/20">
                              {item.vip === "Yes" ? (
                                <Check className="h-4 w-4 text-[#F26B21] mx-auto" />
                              ) : item.vip === "No" ? (
                                <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                              ) : (
                                item.vip
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-purple-700 font-black bg-purple-50/30">
                              {item.strategic === "Yes" ? (
                                <Check className="h-4 w-4 text-purple-700 mx-auto" />
                              ) : item.strategic === "No" ? (
                                <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                              ) : (
                                item.strategic
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accordion: IMPORTANT REMARKS | 重要说明 (from Document Page 2) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition">
            <button
              type="button"
              onClick={() => setRemarksOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#1A73E8]" />
                <span>IMPORTANT REMARKS | 重要说明 (Terms & Regulatory Policies)</span>
              </div>
              {remarksOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {remarksOpen && (
              <div className="pt-4 mt-3 border-t border-slate-200 grid gap-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900">1. Mobile Application Development | 手机应用程序开发</p>
                  <p className="text-slate-500">The mobile application (APP) is currently under development and is expected to launch before end of 2026. (预计将于 2026 年底前正式上线)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">2. Official Communication Requirements | 官方沟通要求</p>
                  <p className="text-slate-500">All company listings, verification procedures, and official buyer communications shall be conducted exclusively through authorized corporate emails. (仅通过企业官方邮箱进行)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">3. Listing Approval and Compliance | 企业展示审核与合规要求</p>
                  <p className="text-slate-500">The platform reserves the right to review, approve, reject, or remove any company listing that fails to meet compliance standards. (保留对不合规企业进行审核或下架的权利)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">4. Buyer and Executive Access | 买家及高层资源对接</p>
                  <p className="text-slate-500">Access to purchasing managers, CEOs, and chairmen is subject to availability, commercial suitability, and mutual consent. (根据合作匹配度与各方共同意愿决定)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">5. Membership Fees | 会员费用</p>
                  <p className="text-slate-500">All membership fees are strictly non-refundable once onboarding and listing verification has commenced. (入驻与宣传服务启动后，会员费用均不予退还)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">6. Accuracy of Information | 信息真实性</p>
                  <p className="text-slate-500">Member factories are solely responsible for ensuring that all submitted certificates, specs, videos, and company data are accurate and lawful. (会员工厂对其提交资料承担全部法律责任)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">7. No Guarantee of Orders | 不保证订单</p>
                  <p className="text-slate-500">Membership does not guarantee orders. Commercial results depend on product competitiveness, pricing, quality, and market demand. (实际商业成果取决于产品自身竞争力与市场需求)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>SeekFactory Global Chairman Sourcing Network • ISO & SGS Audited Plants</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
