"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  totalAmount: number;
  createdAt: string;
  customer?: { name: string };
};

type Props = {
  invoices: Invoice[];
};

function getStatusStyle(status: Invoice["status"]) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "SENT":
      return "bg-blue-100 text-blue-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export default function InvoiceTable({ invoices }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "SENT" | "PAID" | "OVERDUE"
  >("ALL");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔍 FILTER LOGIC
  const filteredInvoices = invoices.filter((inv) => {
    const invoiceNumber = inv.invoiceNumber ?? "";
    const customerName = inv.customer?.name ?? "";

    const matchesSearch =
      invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      {/* ================= FILTERS ================= */}
      <div className="p-4 border-b space-y-3">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search invoice or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 text-gray-700 p-2 rounded-lg text-sm"
        />

        {/* STATUS FILTER */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-1 rounded text-xs transition ${
                statusFilter === s ?
                  "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Invoice #</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800 ">
                  #00{inv.id.slice(0, 8).toUpperCase()}
                </td>

                <td className="p-4 text-gray-700 whitespace-nowrap">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-gray-700">
                  {inv.customer?.name || "—"}
                </td>

                <td className="p-4 text-right font-semibold text-gray-800">
                  ${Number(inv.totalAmount).toLocaleString()}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      inv.status,
                    )}`}
                  >
                    {inv.status}
                  </span>
                </td>

                <td className="p-4 text-right space-x-3">
                  <Link
                    href={`/dashboard/invoices/${inv.id}`}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    View
                  </Link>

                  <button className="text-green-600 text-xs hover:underline">
                    Print
                  </button>
                </td>
              </tr>
            ))}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No matching invoices
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden divide-y">
        {filteredInvoices.map((inv) => (
          <div key={inv.id} className="p-4 space-y-2">
            {/* TOP */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800">{inv.invoiceNumber}</p>

              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(
                  inv.status,
                )}`}
              >
                {inv.status}
              </span>
            </div>

            {/* CUSTOMER */}
            <p className="text-gray-600 text-sm">{inv.customer?.name || "—"}</p>

            {/* DATE */}
            <p className="text-gray-500 text-xs">
              {new Date(inv.createdAt).toLocaleDateString()}
            </p>

            {/* AMOUNT */}
            <p className="font-bold text-gray-800">
              ${Number(inv.totalAmount).toLocaleString()}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-2">
              <Link
                href={`/dashboard/invoices/${inv.id}`}
                className="text-blue-600 text-sm"
              >
                View
              </Link>

              <button className="text-green-600 text-sm">Print</button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            No matching invoices
          </div>
        )}
      </div>
    </div>
  );
}
