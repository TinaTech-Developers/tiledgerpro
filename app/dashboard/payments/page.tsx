"use client";

import { useEffect, useState } from "react";
import PaymentModal from "./_components/paymentmodal";
import { apiFetch } from "@/lib/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const fetchData = async () => {
    const [payRes, invRes, billRes, accRes] = await Promise.allSettled([
      apiFetch(`/api/payments?organizationId=${organizationId}`),
      apiFetch(`/api/invoices`),
      apiFetch(`/api/bills`),
      apiFetch(`/api/accounts?organizationId=${organizationId}`),
    ]);

    setPayments(payRes.status === "fulfilled" ? payRes.value : []);
    setInvoices(invRes.status === "fulfilled" ? invRes.value : []);
    setBills(billRes.status === "fulfilled" ? billRes.value : []);
    setAccounts(accRes.status === "fulfilled" ? accRes.value : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const income = payments
    .filter((p) => p.invoiceId)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const expense = payments
    .filter((p) => p.billId)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filteredPayments = payments.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "INCOME") return !!p.invoiceId;
    if (filter === "EXPENSE") return !!p.billId;
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Payments
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg"
        >
          + New Payment
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Income</p>
          <p className="text-green-600 text-lg md:text-xl font-bold">
            ${income.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Expenses</p>
          <p className="text-red-600 text-lg md:text-xl font-bold">
            ${expense.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Net</p>
          <p className="text-lg md:text-xl font-bold text-amber-600">
            ${(income - expense).toFixed(2)}
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "INCOME", "EXPENSE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded text-sm border ${
              filter === f ?
                "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-gray-700">
                  {p.date ? new Date(p.date).toLocaleDateString() : "—"}
                </td>

                <td className="p-3">
                  {p.invoiceId ?
                    <span className="text-green-600 font-medium">INCOME</span>
                  : <span className="text-red-600 font-medium">EXPENSE</span>}
                </td>

                <td className="p-3 text-gray-700">
                  {p.invoice?.invoiceNumber || p.bill?.id || "—"}
                </td>

                <td className="p-3 text-right font-semibold text-gray-700">
                  ${Number(p.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}

            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <PaymentModal
          invoices={invoices}
          bills={bills}
          accounts={accounts}
          organizationId={organizationId}
          onClose={() => setOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
