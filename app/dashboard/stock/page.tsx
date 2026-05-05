"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function StockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW" | "OUT" | "IN">("ALL");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";
  const LOW_STOCK = 5;

  const fetchProducts = async () => {
    const data = await apiFetch(
      `/api/products?organizationId=${organizationId}`,
    );
    setProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= STATS =================
  const stats = useMemo(() => {
    const total = products.length;
    const low = products.filter(
      (p) => p.stock > 0 && p.stock <= LOW_STOCK,
    ).length;
    const out = products.filter((p) => p.stock === 0).length;

    const value = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0,
    );

    return { total, low, out, value };
  }, [products]);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "ALL" ||
        (filter === "LOW" && p.stock > 0 && p.stock <= LOW_STOCK) ||
        (filter === "OUT" && p.stock === 0) ||
        (filter === "IN" && p.stock > LOW_STOCK);

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Inventory Overview
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Track and manage your stock in real time
        </p>
      </div>

      {/* ================= STATS (RESPONSIVE GRID) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPI title="Products" value={stats.total} tone="green" />
        <KPI title="Low Stock" value={stats.low} tone="yellow" />
        <KPI title="Out of Stock" value={stats.out} tone="red" />
        <KPI
          title="Inventory Value"
          value={`$${stats.value.toFixed(2)}`}
          tone="green"
        />
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm space-y-3">
        <input
          className="w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {["ALL", "IN", "LOW", "OUT"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-full text-gray-700 text-xs sm:text-sm border border-gray-300 transition ${
                filter === f ?
                  "bg-black text-white"
                : "bg-white hover:bg-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid grid-cols-1 sm:hidden gap-3">
        {filtered.map((p) => {
          const status =
            p.stock === 0 ? "OUT"
            : p.stock <= LOW_STOCK ? "LOW"
            : "IN";

          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">{p.name}</p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    status === "OUT" ? "bg-red-100 text-red-700"
                    : status === "LOW" ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                  }`}
                >
                  {status}
                </span>
              </div>

              <p className="text-xs text-gray-500">SKU: {p.sku || "—"}</p>

              <div className="flex justify-between text-sm">
                <span>Price</span>
                <span className="font-semibold">
                  ${Number(p.price).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Stock</span>
                <span className="font-bold">{p.stock}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= TABLE (TABLET + DESKTOP) ================= */}
      <div className="hidden sm:block bg-white border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const status =
                p.stock === 0 ? "OUT"
                : p.stock <= LOW_STOCK ? "LOW"
                : "IN";

              return (
                <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.imageUrl || "/placeholder.png"}
                      className="w-10 h-10 rounded object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-500 font-semibold">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">
                        {p.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-4 text-gray-500">{p.sku || "—"}</td>

                  <td className="p-4 font-medium text-gray-700">
                    ${Number(p.price).toFixed(2)}
                  </td>

                  <td className="p-4 font-semibold text-gray-700">{p.stock}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        status === "OUT" ? "bg-red-100 text-red-700"
                        : status === "LOW" ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= KPI COMPONENT ================= */
function KPI({
  title,
  value,
  tone = "gray",
}: {
  title: string;
  value: any;
  tone?: "gray" | "red" | "yellow" | "green" | "blue" | "black";
}) {
  const styles: any = {
    gray: "bg-white",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl border shadow-sm ${styles[tone]}`}>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
    </div>
  );
}
