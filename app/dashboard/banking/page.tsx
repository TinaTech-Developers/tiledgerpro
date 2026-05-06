"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Account = {
  id: string;
  name: string;
  type?: string;
  balance: number;
};

type Transaction = {
  id: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  category?: string;
  date: string;
  accountId: string;
};

export default function BankingPage() {
  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const accRes = await apiFetch(
          `/api/accounts?organizationId=${organizationId}`,
        );

        const txRes = await apiFetch(
          `/api/transactions?organizationId=${organizationId}`,
        );

        setAccounts(accRes?.accounts || []);
        setTransactions(txRes || []);
      } catch (err) {
        console.error("BANKING LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ================= SAFE DATE =================
  const formatDate = (date?: string) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().split("T")[0];
  };

  // ================= CALCULATIONS =================
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce(
      (sum, a) => sum + Number(a.balance || 0),
      0,
    );

    const income = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalBalance,
      income,
      expense,
      net: income - expense,
    };
  }, [accounts, transactions]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading banking data...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
        <p className="text-sm text-gray-500">
          Manage accounts, balances and transactions
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={`$${stats.totalBalance}`} />
        <StatCard title="Income" value={`$${stats.income}`} />
        <StatCard title="Expenses" value={`$${stats.expense}`} />
        <StatCard title="Net Cashflow" value={`$${stats.net}`} />
      </div>

      {/* ================= ACCOUNTS ================= */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h2 className="font-semibold mb-3">Accounts</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-800">{a.name}</p>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {a.type || "ACCOUNT"}
                </span>
              </div>

              <p className="text-lg font-bold text-gray-900">
                ${Number(a.balance).toFixed(2)}
              </p>

              <button className="text-sm text-blue-600 text-left">
                View ledger →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TRANSACTIONS ================= */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h2 className="font-semibold mb-3">Recent Transactions</h2>

        {/* MOBILE VIEW */}
        <div className="md:hidden space-y-3">
          {transactions.slice(0, 10).map((t) => (
            <div key={t.id} className="border rounded-lg p-3 space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{t.category || "—"}</p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    t.type === "CREDIT" ?
                      "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.type}
                </span>
              </div>

              <p className="text-sm text-gray-500">{formatDate(t.date)}</p>

              <p className="font-semibold text-right">
                ${Number(t.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Date</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.slice(0, 10).map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2">{formatDate(t.date)}</td>

                  <td>{t.category || "—"}</td>

                  <td>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        t.type === "CREDIT" ?
                          "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>

                  <td className="text-right font-medium">
                    ${Number(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <p className="text-center text-gray-400 py-6">
            No transactions found
          </p>
        )}
      </div>
    </div>
  );
}

// ================= STAT CARD =================
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg sm:text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
