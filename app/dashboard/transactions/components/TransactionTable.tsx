"use client";

import React, { useState } from "react";

type LedgerEntry = {
  id: string;
  debit: number;
  credit: number;
  account?: { name?: string };
};

type Transaction = {
  id: string;
  createdAt: string;
  notes?: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  account?: { name?: string };
  ledgerEntries?: LedgerEntry[];
};

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatMoney = (v?: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(v || 0);

  return (
    <div className="bg-white rounded- shadow-sm border overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Account</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <React.Fragment key={t.id}>
                {/* MAIN ROW */}
                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-gray-800 font-medium">
                    {t.notes || "—"}
                  </td>

                  <td className="p-4 text-gray-600">
                    {t.account?.name || "Multiple Accounts"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        t.type === "DEBIT" ?
                          "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>

                  <td className="p-4 text-right font-semibold text-gray-800">
                    {formatMoney(t.amount)}
                  </td>

                  <td className="flex items-center gap-2 justify-center p-4 text-center">
                    <button
                      onClick={async () => {
                        if (!confirm("Reverse this transaction?")) return;

                        await fetch("/api/transactions/reverse", {
                          method: "POST",
                          body: JSON.stringify({ transactionId: t.id }),
                        });

                        location.reload(); // or refetch
                      }}
                      className="text-red-600 hover:underline ml-2"
                    >
                      Reverse
                    </button>
                    <button
                      onClick={() => toggle(t.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedId === t.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED LEDGER */}
                {expandedId === t.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <div className="border rounded-xl bg-white p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Ledger Breakdown
                        </h3>

                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b">
                              <th className="text-left p-2">Account</th>
                              <th className="text-right p-2">Debit</th>
                              <th className="text-right p-2">Credit</th>
                            </tr>
                          </thead>

                          <tbody>
                            {t.ledgerEntries?.length ?
                              t.ledgerEntries.map((e) => (
                                <tr key={e.id} className="border-b">
                                  <td className="p-2 text-gray-700">
                                    {e.account?.name || "—"}
                                  </td>

                                  <td className="p-2 text-right text-red-600">
                                    {e.debit ? formatMoney(e.debit) : "—"}
                                  </td>

                                  <td className="p-2 text-right text-green-600">
                                    {e.credit ? formatMoney(e.credit) : "—"}
                                  </td>
                                </tr>
                              ))
                            : <tr>
                                <td
                                  colSpan={3}
                                  className="text-center p-3 text-gray-400"
                                >
                                  No ledger entries found
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* EMPTY STATE */}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-10 text-gray-500">
                  No transactions recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
