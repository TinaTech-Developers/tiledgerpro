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
    setExpandedId((p) => (p === id ? null : id));
  };

  const formatMoney = (v?: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(v || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* ========================= */}
      {/* 💻 DESKTOP TABLE */}
      {/* ========================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
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
                <tr className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-600">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-gray-800 font-medium">
                    {t.notes || "—"}
                  </td>

                  <td className="p-4 text-gray-600">
                    {t.account?.name || "Multiple"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        t.type === "DEBIT" ?
                          "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>

                  <td className="p-4 text-right font-semibold">
                    {formatMoney(t.amount)}
                  </td>

                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => toggle(t.id)}
                      className="text-blue-600"
                    >
                      {expandedId === t.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {/* LEDGER (DESKTOP) */}
                {expandedId === t.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm font-semibold mb-2 text-gray-700">
                          Ledger Breakdown
                        </p>

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
          </tbody>
        </table>
      </div>

      {/* ========================= */}
      {/* 📱 MOBILE CARDS */}
      {/* ========================= */}
      <div className="md:hidden space-y-3 p-3">
        {transactions.map((t) => (
          <div key={t.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                {t.notes || "Transaction"}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  t.type === "DEBIT" ?
                    "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
                }`}
              >
                {t.type}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {t.account?.name || "Multiple Accounts"}
            </p>

            <p className="text-sm font-bold">{formatMoney(t.amount)}</p>

            <p className="text-xs text-gray-400">
              {new Date(t.createdAt).toLocaleDateString()}
            </p>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => toggle(t.id)}
                className="text-blue-600 text-sm"
              >
                {expandedId === t.id ? "Hide Ledger" : "View Ledger"}
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Reverse this transaction?")) return;

                  await fetch("/api/transactions/reverse", {
                    method: "POST",
                    body: JSON.stringify({ transactionId: t.id }),
                  });

                  location.reload();
                }}
                className="text-red-600 text-sm"
              >
                Reverse
              </button>
            </div>

            {/* LEDGER (MOBILE) */}
            {expandedId === t.id && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Ledger Breakdown
                </p>

                {t.ledgerEntries?.length ?
                  t.ledgerEntries.map((e) => (
                    <div
                      key={e.id}
                      className="flex justify-between text-xs py-1"
                    >
                      <span>{e.account?.name || "—"}</span>
                      <span className="text-red-600">
                        {e.debit ? formatMoney(e.debit) : ""}
                      </span>
                      <span className="text-green-600">
                        {e.credit ? formatMoney(e.credit) : ""}
                      </span>
                    </div>
                  ))
                : <p className="text-xs text-gray-400">No ledger entries</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {transactions.length === 0 && (
        <div className="text-center p-10 text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  );
}
