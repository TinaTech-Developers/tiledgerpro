"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Asset = {
  id: string;
  name: string;
  category?: string;
  purchaseCost: number;
  currentValue: number;
  purchaseDate: string;
  status: "ACTIVE" | "DISPOSED" | "SOLD";
};

export default function AssetsPage() {
  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    category: "",
    purchaseCost: "",
    purchaseDate: "",
    usefulLife: "",
  });

  const safeAssets = Array.isArray(assets) ? assets : [];

  // ================= FETCH =================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(
          `/api/assets?organizationId=${organizationId}`,
        );

        setAssets(Array.isArray(res) ? res : res?.assets || []);
      } catch (err) {
        console.error("ASSETS ERROR:", err);
      }
    };

    load();
  }, []);

  // ================= FILTER =================
  const filteredAssets = useMemo(() => {
    return safeAssets.filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;

      const matchCategory =
        categoryFilter === "ALL" || a.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [safeAssets, search, statusFilter, categoryFilter]);

  // ================= STATS =================
  const stats = useMemo(() => {
    const totalValue = safeAssets.reduce(
      (sum, a) => sum + Number(a.currentValue || 0),
      0,
    );

    const active = safeAssets.filter((a) => a.status === "ACTIVE").length;
    const disposed = safeAssets.filter((a) => a.status !== "ACTIVE").length;

    const totalCost = safeAssets.reduce(
      (sum, a) => sum + Number(a.purchaseCost || 0),
      0,
    );

    return { totalValue, active, disposed, totalCost };
  }, [safeAssets]);

  // ================= CREATE =================
  const createAsset = async () => {
    if (!form.name || !form.purchaseCost) return;

    try {
      await apiFetch("/api/assets", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          name: form.name,
          category: form.category || null,
          purchaseCost: Number(form.purchaseCost),
          purchaseDate: form.purchaseDate || null,
          usefulLife: form.usefulLife ? Number(form.usefulLife) : null,
        }),
      });

      setOpen(false);

      setForm({
        name: "",
        category: "",
        purchaseCost: "",
        purchaseDate: "",
        usefulLife: "",
      });

      const res = await apiFetch(
        `/api/assets?organizationId=${organizationId}`,
      );

      setAssets(Array.isArray(res) ? res : res?.assets || []);
    } catch (err) {
      console.error("CREATE ASSET ERROR:", err);
    }
  };

  useEffect(() => {
    if (open) {
      setForm((p) => ({
        ...p,
        purchaseDate: new Date().toISOString().split("T")[0],
      }));
    }
  }, [open]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  // ================= UI =================
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Assets</h1>
          <p className="text-sm text-gray-500">
            Track company assets and depreciation
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          + Add Asset
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI title="Total Value" value={formatMoney(stats.totalValue)} />
        <KPI title="Purchase Cost" value={formatMoney(stats.totalCost)} />
        <KPI title="Active Assets" value={stats.active} />
        <KPI title="Disposed" value={stats.disposed} />
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-3 md:hidden">
        {filteredAssets.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between">
              <p className="font-semibold text-gray-800">{a.name}</p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  a.status === "ACTIVE" ?
                    "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
                }`}
              >
                {a.status}
              </span>
            </div>

            <p className="text-sm text-gray-800">
              {a.category || "No category"}
            </p>

            <div className="flex justify-between text-gray-900 text-sm mt-2">
              <span>Cost</span>
              <span className="font-semibold">
                {formatMoney(a.purchaseCost)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-900">
              <span>Value</span>
              <span className="font-semibold">
                {formatMoney(a.currentValue)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= TABLE (DESKTOP) ================= */}
      <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Asset</th>
              <th>Category</th>
              <th>Purchase Cost</th>
              <th>Current Value</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 text-gray-800">{a.name}</td>
                <td className="p-3 text-gray-600">{a.category || "—"}</td>
                <td className="p-3 text-gray-600">
                  {formatMoney(a.purchaseCost)}
                </td>
                <td className="p-3 text-gray-600">
                  {formatMoney(a.currentValue)}
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      a.status === "ACTIVE" ?
                        "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="p-3 text-gray-600">
                  {a.purchaseDate?.split("T")[0] || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Add Asset</h2>

            <input
              placeholder="Asset Name"
              className="w-full border p-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Category"
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              type="number"
              placeholder="Purchase Cost"
              className="w-full border p-2 rounded"
              value={form.purchaseCost}
              onChange={(e) =>
                setForm({ ...form, purchaseCost: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({ ...form, purchaseDate: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Useful Life"
              className="w-full border p-2 rounded"
              value={form.usefulLife}
              onChange={(e) => setForm({ ...form, usefulLife: e.target.value })}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                onClick={createAsset}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= KPI =================
function KPI({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-bold text-black">{value}</p>
    </div>
  );
}
