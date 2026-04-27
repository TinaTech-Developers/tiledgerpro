"use client";

import { useEffect, useMemo, useState } from "react";
import TransactionTable from "./components/TransactionTable";
import TransactionModal from "./components/TransactionModal";
import { apiFetch } from "@/lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // 🔥 FILTER STATE
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    const [txns, accs] = await Promise.all([
      apiFetch("/api/transactions"),
      apiFetch("/api/accounts"),
    ]);

    setTransactions(Array.isArray(txns) ? txns : []);
    setAccounts(Array.isArray(accs) ? accs : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 FILTER ENGINE (CLIENT-SIDE)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.notes?.toLowerCase().includes(search.toLowerCase()) ||
        t.account?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesAccount =
        accountFilter ? t.account?.id === accountFilter : true;

      const matchesType = typeFilter ? t.type === typeFilter : true;

      const matchesDate =
        (!startDate || new Date(t.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(t.createdAt) <= new Date(endDate));

      return matchesSearch && matchesAccount && matchesType && matchesDate;
    });
  }, [transactions, search, accountFilter, typeFilter, startDate, endDate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + New Transaction
        </button>
      </div>

      {/* 🔥 FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          placeholder="Search notes / account..."
          className="border p-2 text-gray-600 border-gray-500 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 text-gray-600 border-gray-500  rounded"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
        >
          <option value="">All Accounts</option>
          {accounts.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 text-gray-600 border-gray-500  rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="DEBIT">Debit</option>
          <option value="CREDIT">Credit</option>
        </select>

        <input
          type="date"
          className="border p-2 text-gray-600 border-gray-500  rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 text-gray-600 border-gray-500  rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <TransactionTable transactions={filteredTransactions} />

      {/* MODAL */}
      {open && (
        <TransactionModal
          accounts={accounts}
          onClose={() => setOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
