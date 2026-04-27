"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import VendorModal from "./_components/vendormodal";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(
        `/api/vendors?organizationId=${organizationId}`,
      );
      setVendors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-gray-500">
            Manage your suppliers and partners
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Vendor
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="w-full border p-2 rounded"
        placeholder="Search vendors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ?
              <tr>
                <td className="p-4" colSpan={4}>
                  Loading...
                </td>
              </tr>
            : filtered.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3 font-medium">{v.name}</td>
                  <td className="p-3">{v.email || "-"}</td>
                  <td className="p-3">{v.phone || "-"}</td>

                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelected(v);
                        setOpen(true);
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <VendorModal
          vendor={selected}
          organizationId={organizationId} // ✅ FIXED
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchVendors();
          }}
        />
      )}
    </div>
  );
}
