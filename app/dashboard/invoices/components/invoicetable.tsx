"use client";

import Link from "next/link";

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
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        {/* HEADER */}
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

        {/* BODY */}
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t hover:bg-gray-50 transition">
              <td className="p-4 font-medium text-gray-800">
                {inv.invoiceNumber}
              </td>

              <td className="p-4 text-gray-700">
                {new Date(inv.createdAt).toLocaleDateString()}
              </td>

              <td className="p-4 text-gray-700">{inv.customer?.name || "—"}</td>

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

              <td className="p-4 text-right space-x-2">
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

          {/* EMPTY */}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-6 text-gray-500">
                No invoices yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
