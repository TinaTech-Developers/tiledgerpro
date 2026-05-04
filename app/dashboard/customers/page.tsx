"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

import CustomerTable from "./_components/customertable";
import CustomerModal from "./_components/customermodal";
import CustomerDrawer from "./_components/customerdrawer";
import CustomerStats from "./_components/customerstats";
import CustomerFilters from "./_components/customerfilters";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data = await apiFetch("/api/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 ">
          Customers
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          + New Customer
        </button>
      </div>

      {/* STATS */}
      <CustomerStats
        total={customers.length}
        newThisMonth={3}
        active={customers.length}
        owing={1}
      />

      {/* FILTERS */}
      <CustomerFilters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />

      {/* TABLE WRAPPER */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <CustomerTable
          customers={customers}
          onSelect={setSelected}
          onEdit={() => setOpen(true)}
        />
      </div>

      {/* MODAL */}
      {open && (
        <CustomerModal onClose={() => setOpen(false)} onSuccess={fetchData} />
      )}

      {/* DRAWER */}
      {selected && (
        <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
