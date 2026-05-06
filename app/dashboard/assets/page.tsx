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

  // ================= FETCH =================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(
          `/api/assets?organizationId=${organizationId}`,
        );

        setAssets(res || []);
      } catch (err) {
        console.error("ASSETS ERROR:", err);
      }
    };

    load();
  }, []);

  // ===============Filter Logic ================
  const filteredAssets = useMemo(() => {
    const safeAssets = Array.isArray(assets) ? assets : [];

    return safeAssets.filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;

      const matchCategory =
        categoryFilter === "ALL" || a.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [assets, search, statusFilter, categoryFilter]);

  // ================= STATS =================
  const stats = useMemo(() => {
    const totalValue = assets.reduce(
      (sum, a) => sum + Number(a.currentValue || 0),
      0,
    );

    const active = assets.filter((a) => a.status === "ACTIVE").length;
    const disposed = assets.filter((a) => a.status !== "ACTIVE").length;

    const totalCost = assets.reduce(
      (sum, a) => sum + Number(a.purchaseCost || 0),
      0,
    );

    return {
      totalValue,
      active,
      disposed,
      totalCost,
    };
  }, [assets]);

  // ================= CREATE =================
  const createAsset = async () => {
    if (!form.name || !form.purchaseCost) {
      alert("Name and Purchase Cost are required");
      return;
    }

    try {
      await apiFetch("/api/assets", {
        method: "POST",
        body: JSON.stringify({
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

      // refresh assets
      const res = await apiFetch(`/api/assets`);
      setAssets(res || []);
    } catch (err) {
      console.error("CREATE ASSET ERROR:", err);
      alert("Failed to create asset");
    }
  };

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        purchaseDate: new Date().toISOString().split("T")[0],
      }));
    }
  }, [open]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Assets</h1>
          <p className="text-sm text-gray-500">
            Track company assets and depreciation
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Add Asset
        </button>
      </div>

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI title="Total Value" value={`$${stats.totalValue}`} />
        <KPI title="Purchase Cost" value={`$${stats.totalCost}`} />
        <KPI title="Active Assets" value={stats.active} />
        <KPI title="Disposed" value={stats.disposed} />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Asset</th>
              <th>Category</th>
              <th>Purchase Cost</th>
              <th>Current Value</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-medium text-gray-700">{a.name}</td>
                <td className="text-gray-700">{a.category || "—"}</td>
                <td className="text-gray-700">{formatMoney(a.purchaseCost)}</td>
                <td className="text-gray-700">
                  ${Number(a.currentValue || 0).toFixed(2)}
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
                <td className="text-gray-700">
                  {a.purchaseDate?.split("T")[0] || "—"}
                </td>
                <td>
                  <div className="relative">
                    <button className="text-gray-500">⋮</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Add Asset</h2>

            <input
              placeholder="Asset Name"
              className="w-full border p-2 rounded border-gray-300 text-gray-700"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <select
              className="w-full border p-2 rounded border-gray-300 text-gray-700"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option>Vehicles</option>
              <option>Equipment</option>
              <option>Buildings</option>
              <option>Furniture</option>
              <option>Computers</option>
            </select>

            <input
              type="number"
              placeholder="Purchase Cost"
              className="w-full border p-2 rounded border-gray-300 text-gray-700"
              value={form.purchaseCost}
              onChange={(e) =>
                setForm({ ...form, purchaseCost: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border p-2 rounded border-gray-300 text-gray-700"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({ ...form, purchaseDate: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Useful Life (years)"
              className="w-full border p-2 rounded border-gray-300 text-gray-700"
              value={form.usefulLife}
              onChange={(e) => setForm({ ...form, usefulLife: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
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
      {form.purchaseCost && form.usefulLife && (
        <div className="bg-gray-100 p-3 rounded text-sm">
          Monthly Depreciation:{" "}
          <b>
            $
            {(
              Number(form.purchaseCost) /
              (Number(form.usefulLife) * 12)
            ).toFixed(2)}
          </b>
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
