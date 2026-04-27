"use client";

import { useEffect, useState } from "react";
import TransactionTable from "./TransactionTable";
import TransactionModal from "./TransactionModal";
import { apiFetch } from "@/lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg"
        >
          + New Transaction
        </button>
      </div>

      {/* Table */}
      <TransactionTable transactions={transactions} />

      {/* Modal */}
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
