"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Eye,
} from "lucide-react";
import type { SellerProduct } from "../types";

type Props = {
  products: SellerProduct[];
  onOpenAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
};

export function ProductsTab({ products, onOpenAddProduct, onDeleteProduct }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>Product Catalog & Machinery Inventory</span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.2 text-xs font-bold text-brand-blue">
              {products.length} Listed
            </span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage your machinery listings, technical parameters, and export pricing
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Product</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by model, category, or specifications..."
            className="w-full rounded-xl border border-line bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-hidden shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-800 focus:border-brand-blue focus:outline-hidden shadow-xs"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-800 focus:border-brand-blue focus:outline-hidden shadow-xs"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-xs hover:border-brand-blue transition"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Link
                href={`/products/${product.slug}`}
                className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-canvas border border-line block group/img"
                title={`View ${product.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </Link>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                    {product.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      product.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {product.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">Added {product.createdAt}</span>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="block font-bold text-sm text-neutral-900 hover:text-brand-blue transition truncate"
                  title={`View ${product.name}`}
                >
                  {product.name}
                </Link>

                <p className="text-xs font-semibold text-neutral-800">
                  ₹{(product.priceInr ?? 0).toLocaleString()} / {product.unit} •{" "}
                  <span className="text-ink-muted font-normal">MOQ: {product.moq}</span>
                </p>

                {/* Key specs pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded-md bg-canvas border border-line px-2 py-0.5 text-[10px] text-neutral-600"
                    >
                      <strong>{k}:</strong> {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Stats & Action Buttons */}
            <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-line">
              <div className="flex items-center gap-4 text-center">
                <div>
                  <p className="text-xs font-extrabold text-neutral-900">{product.viewsCount}</p>
                  <p className="text-[10px] text-neutral-400">Views</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-red-600">{product.inquiriesCount}</p>
                  <p className="text-[10px] text-neutral-400">Inquiries</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas hover:bg-white hover:border-brand-blue hover:text-brand-blue px-3 py-1.5 text-xs font-bold text-neutral-700 transition shadow-2xs"
                  title="View Public Marketplace Listing"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link> 

                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.id)}
                  className="rounded-xl border border-line p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
            <Package className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">No products match your search</p>
            <p className="text-xs text-ink-muted mt-1">
              Try adjusting your category filter or post a new product listing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
