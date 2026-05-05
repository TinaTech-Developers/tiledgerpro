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
      setVendors(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-gray-500">
            Manage your suppliers and partners
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded w-full md:w-auto"
        >
          + Add Vendor
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="w-full md:max-w-sm border p-2 rounded text-sm"
        placeholder="Search vendors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE / CARDS */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ?
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              : filtered.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{v.name}</td>
                    <td className="p-3">{v.email || "-"}</td>
                    <td className="p-3">{v.phone || "-"}</td>

                    <td className="p-3 text-right">
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

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="md:hidden divide-y">
          {loading ?
            <div className="p-4 text-center">Loading...</div>
          : filtered.map((v) => (
              <div key={v.id} className="p-4 space-y-2">
                <p className="font-semibold text-gray-800">{v.name}</p>

                <p className="text-sm text-gray-600">Email: {v.email || "-"}</p>

                <p className="text-sm text-gray-600">Phone: {v.phone || "-"}</p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelected(v);
                      setOpen(true);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          }

          {!loading && filtered.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              No vendors found
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <VendorModal
          vendor={selected}
          organizationId={organizationId}
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
