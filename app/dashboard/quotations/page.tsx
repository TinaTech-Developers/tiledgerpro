"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import QuotationTable from "./_components/QuotationTable";
import { useRouter } from "next/navigation";

export default function QuotationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const router = useRouter();

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  useEffect(() => {
    apiFetch(`/api/quotations?organizationId=${organizationId}`).then(setData);
  }, []);

  const filtered = useMemo(() => {
    return data
      .filter((q) => {
        const matchesSearch =
          q.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          q.id?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = status ? q.status === status : true;

        const matchesDate =
          (!startDate || new Date(q.createdAt) >= new Date(startDate)) &&
          (!endDate || new Date(q.createdAt) <= new Date(endDate));

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sort === "asc") return a.totalAmount - b.totalAmount;
        return b.totalAmount - a.totalAmount;
      });
  }, [data, search, status, sort, startDate, endDate]);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Quotations
          </h1>
          <p className="text-sm text-gray-500">Manage customer quotations</p>
        </div>

        <button
          onClick={() => router.push("/dashboard/quotations/new")}
          className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          + New Quotation
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer / ID..."
            className="border p-2 rounded text-sm w-full text-gray-600 border-gray-300"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded text-sm w-full text-gray-600 border-gray-300"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border p-2 rounded text-sm w-full text-gray-600 border-gray-300"
          >
            <option value="desc">Highest Amount</option>
            <option value="asc">Lowest Amount</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded text-sm w-full text-gray-600 border-gray-300"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded text-sm w-full text-gray-600 border-gray-300"
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <QuotationTable data={filtered} />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold">{data.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">
            {data.filter((q) => q.status === "PENDING").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-xl font-bold text-green-600">
            {data.filter((q) => q.status === "APPROVED").length}
          </p>
        </div>
      </div>
    </div>
  );
}
