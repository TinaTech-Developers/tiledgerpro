"use client";

import Link from "next/link";

type Invoice = {
  id: string;
  invoiceNumber: string; // INV-0001
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  createdAt: string;

  customer?: {
    name: string;
  };
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
    case "DRAFT":
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export default function InvoiceTable({ invoices }: Props) {
  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      {/* TABLE HEADER */}
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

        {/* TABLE BODY */}
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t hover:bg-gray-50 transition">
              {/* INVOICE NUMBER */}
              <td className="p-4 font-medium text-gray-800">
                {inv.invoiceNumber}
              </td>

              {/* DATE */}
              <td className="p-4 text-gray-700">
                {new Date(inv.createdAt).toLocaleDateString()}
              </td>

              {/* CUSTOMER */}
              <td className="p-4 text-gray-700">{inv.customer?.name || "—"}</td>

              {/* AMOUNT */}
              <td className="p-4 text-gray-800 text-right font-semibold">
                ${Number(inv.totalAmount).toLocaleString()}
              </td>

              {/* STATUS */}
              <td className="p-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                    inv.status,
                  )}`}
                >
                  {inv.status}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="p-4 text-right space-x-2">
                <Link
                  href={`/dashboard/invoices/${inv.id}`}
                  className="text-blue-600 hover:underline text-xs"
                >
                  View
                </Link>

                <button className="text-green-600 hover:underline text-xs">
                  Print
                </button>
              </td>
            </tr>
          ))}

          {/* EMPTY STATE */}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-8 text-gray-500">
                No invoices yet. Create your first invoice.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
