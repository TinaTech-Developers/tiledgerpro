"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import AddBillModal from "./_components/AddBillModal";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("dueDate");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    const [billsRes, vendorsRes, accountsRes] = await Promise.all([
      apiFetch(`/api/bills?organizationId=${organizationId}`),
      apiFetch(`/api/vendors?organizationId=${organizationId}`),
      apiFetch(`/api/accounts?organizationId=${organizationId}`),
    ]);

    setBills(billsRes);
    setVendors(vendorsRes);
    setAccounts(accountsRes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // FILTERED + SEARCHED + SORTED
  // =========================
  const filteredBills = useMemo(() => {
    let data = [...bills];

    // SEARCH
    if (search) {
      data = data.filter(
        (b) =>
          b.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // STATUS FILTER
    if (status !== "ALL") {
      data = data.filter((b) => b.status === status);
    }

    // SORT
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

  // =========================
  // SUMMARY CARDS
  // =========================
  const totalOutstanding = bills.reduce(
    (acc, b) => acc + (b.status !== "PAID" ? b.totalAmount : 0),
    0,
  );

  const overdueCount = bills.filter(
    (b) => b.status !== "PAID" && b.dueDate && new Date(b.dueDate) < new Date(),
  ).length;

  const paidCount = bills.filter((b) => b.status === "PAID").length;

  return (
    <div className="p-6 space-y-6">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 ">Bills</h1>
          <p className="text-sm text-gray-500">
            Manage supplier bills & payables
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Add Bill
        </button>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Outstanding</p>
          <h2 className="text-xl font-bold text-gray-900">
            ${totalOutstanding}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Overdue</p>
          <h2 className="text-xl font-bold text-red-500">{overdueCount}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Paid</p>
          <h2 className="text-xl font-bold text-green-600">{paidCount}</h2>
        </div>
      </div>

      {/* =========================
          FILTER BAR
      ========================= */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="border p-2 rounded text-gray-600 border-gray-300 w-64"
          placeholder="Search vendor or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded text-gray-600 border-gray-300"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>

        <select
          className="border p-2 rounded text-gray-600 border-gray-300"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-400 text-left">
            <tr>
              <th className="p-3">Vendor</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Due Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredBills.map((b) => {
              const isOverdue =
                b.status !== "PAID" &&
                b.dueDate &&
                new Date(b.dueDate) < new Date();

              return (
                <tr
                  key={b.id}
                  className={`border-t ${isOverdue ? "bg-red-50" : ""}`}
                >
                  <td className="p-3 text-gray-600  font-medium">
                    {b.vendor?.name}
                  </td>

                  <td className="p-3 text-gray-600 ">${b.totalAmount}</td>

                  <td className="p-3 text-gray-600 ">
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

                  <td className="p-3 text-gray-600">
                    {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================
          MODAL
      ========================= */}
      {showModal && (
        <AddBillModal
          vendors={vendors}
          accounts={accounts}
          organizationId={organizationId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
