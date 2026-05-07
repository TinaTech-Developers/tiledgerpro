"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import AddBillModal from "./_components/AddBillModal";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("dueDate");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  // FETCH
  const fetchData = async () => {
    try {
      setLoading(true);

      const [billsRes, vendorsRes, accountsRes] = await Promise.all([
        apiFetch(`/api/bills?organizationId=${organizationId}`),
        apiFetch(`/api/vendors?organizationId=${organizationId}`),
        apiFetch(`/api/accounts?organizationId=${organizationId}`),
      ]);

      setBills(Array.isArray(billsRes) ? billsRes : (billsRes?.data ?? []));
      setVendors(
        Array.isArray(vendorsRes) ? vendorsRes : (vendorsRes?.data ?? []),
      );
      setAccounts(
        Array.isArray(accountsRes) ? accountsRes : (accountsRes?.data ?? []),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FILTERS
  const filteredBills = useMemo(() => {
    let data = [...bills];

    if (search) {
      data = data.filter(
        (b) =>
          b.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== "ALL") {
      data = data.filter((b) => b.status === status);
    }

    data.sort((a, b) => {
      if (sort === "amount") return b.totalAmount - a.totalAmount;
      if (sort === "dueDate")
        return (
          new Date(a.dueDate || 0).getTime() -
          new Date(b.dueDate || 0).getTime()
        );
      return 0;
    });

    return data;
  }, [bills, search, status, sort]);

  // SUMMARY
  const totalOutstanding = bills.reduce(
    (acc, b) => acc + (b.status !== "PAID" ? b.totalAmount : 0),
    0,
  );

  const overdueCount = bills.filter(
    (b) => b.status !== "PAID" && b.dueDate && new Date(b.dueDate) < new Date(),
  ).length;

  const paidCount = bills.filter((b) => b.status === "PAID").length;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Bills</h1>
          <p className="text-sm text-gray-500">
            Manage supplier bills & payables
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-4 py-2 rounded w-full md:w-auto"
        >
          + Add Bill
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Outstanding</p>
          <h2 className="text-xl font-bold text-gray-900">
            ${totalOutstanding}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Overdue</p>
          <h2 className="text-xl font-bold text-red-500">{overdueCount}</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Paid</p>
          <h2 className="text-xl font-bold text-green-600">{paidCount}</h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-3 md:p-4 rounded-lg shadow">
        <input
          className="w-full md:max-w-sm border p-2 rounded text-sm text-gray-700 border-gray-300"
          placeholder="Search vendor or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded text-sm text-gray-700 border-gray-300"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>

        <select
          className="border p-2 rounded text-sm text-gray-700 border-gray-300"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-400 text-left">
            <tr>
              <th className="p-3 text-white">Vendor</th>
              <th className="p-3 text-white">Amount</th>
              <th className="p-3 text-white">Status</th>
              <th className="p-3 text-white">Due Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ?
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            : filteredBills.map((b) => {
                const isOverdue =
                  b.status !== "PAID" &&
                  b.dueDate &&
                  new Date(b.dueDate) < new Date();

                return (
                  <tr
                    key={b.id}
                    className={`border-t ${isOverdue ? "bg-red-50" : ""}`}
                  >
                    <td className="p-3 text-gray-700 font-medium">
                      {b.vendor?.name}
                    </td>

                    <td className="p-3 text-gray-700">${b.totalAmount}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          b.status === "PAID" ? "bg-green-100 text-green-700"
                          : b.status === "PARTIAL" ?
                            "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="p-3 text-gray-700">
                      {b.dueDate ?
                        new Date(b.dueDate).toLocaleDateString()
                      : "-"}
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {loading ?
          <div className="text-center p-4">Loading...</div>
        : filteredBills.map((b) => {
            const isOverdue =
              b.status !== "PAID" &&
              b.dueDate &&
              new Date(b.dueDate) < new Date();

            return (
              <div
                key={b.id}
                className={`bg-white p-4 rounded-lg shadow space-y-2 ${
                  isOverdue ? "border-l-4 border-red-500" : ""
                }`}
              >
                <p className="font-semibold text-gray-800">{b.vendor?.name}</p>

                <p className="text-sm text-gray-600">
                  Amount: ${b.totalAmount}
                </p>

                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      b.status === "PAID" ? "bg-green-100 text-green-700"
                      : b.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  Due:{" "}
                  {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "-"}
                </p>
              </div>
            );
          })
        }
      </div>

      {/* MODAL */}
      {open && (
        <AddBillModal
          vendors={vendors}
          accounts={accounts}
          organizationId={organizationId}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
