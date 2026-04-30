"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Entry = {
  accountId: string;
  debit: number;
  credit: number;
};

export default function TransactionModal({
  accounts,
  onClose,
  onSuccess,
}: any) {
  const [description, setDescription] = useState("");

  const [entries, setEntries] = useState<Entry[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ]);

  //////////////////////////////////////////////////////
  // 🔥 UPDATE ENTRY (SMART)
  //////////////////////////////////////////////////////
  const updateEntry = (
    index: number,
    field: keyof Entry,
    value: string | number,
  ) => {
    const updated = [...entries];

    if (field === "debit") {
      updated[index].debit = Number(value);
      updated[index].credit = 0;
    } else if (field === "credit") {
      updated[index].credit = Number(value);
      updated[index].debit = 0;
    } else {
      updated[index][field] = value as never;
    }

    setEntries(updated);
  };

  //////////////////////////////////////////////////////
  // ➕ ADD ROW
  //////////////////////////////////////////////////////
  const addRow = () => {
    setEntries([...entries, { accountId: "", debit: 0, credit: 0 }]);
  };

  //////////////////////////////////////////////////////
  // ❌ REMOVE ROW
  //////////////////////////////////////////////////////
  const removeRow = (index: number) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  //////////////////////////////////////////////////////
  // 🧮 CALCULATIONS
  //////////////////////////////////////////////////////
  const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

  const difference = totalDebit - totalCredit;
  const isBalanced = difference === 0;

  //////////////////////////////////////////////////////
  // ⚡ AUTO BALANCE LAST ROW
  //////////////////////////////////////////////////////
  const autoBalance = () => {
    const updated = [...entries];

    if (updated.length < 2) return;

    const lastIndex = updated.length - 1;

    const debitSum = updated
      .slice(0, lastIndex)
      .reduce((s, e) => s + (e.debit || 0), 0);

    const creditSum = updated
      .slice(0, lastIndex)
      .reduce((s, e) => s + (e.credit || 0), 0);

    const diff = debitSum - creditSum;

    if (diff > 0) {
      updated[lastIndex].credit = diff;
      updated[lastIndex].debit = 0;
    } else {
      updated[lastIndex].debit = Math.abs(diff);
      updated[lastIndex].credit = 0;
    }

    setEntries(updated);
  };

  //////////////////////////////////////////////////////
  // 🚀 SUBMIT
  //////////////////////////////////////////////////////
  const handleSubmit = async () => {
    if (!isBalanced) {
      return alert("Transaction not balanced");
    }

    if (entries.some((e) => !e.accountId)) {
      return alert("All rows must have an account");
    }

    await apiFetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        description,
        entries,
      }),
    });

    onSuccess();
    onClose();
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-3">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl space-y-4 shadow-xl">
        {" "}
        <h2 className="text-xl font-bold text-gray-800">Journal Entry</h2>
        {/* Description */}
        <input
          placeholder="Description"
          className="w-full border text-gray-600 border-gray-500 p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* Table Header */}
        <div className="grid grid-cols-4 font-semibold text-gray-600 border-b pb-2">
          <span>Account</span>
          <span>Debit</span>
          <span>Credit</span>
          <span></span>
        </div>
        {/* Rows */}
        {entries.map((e, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-center">
            <select
              className="border p-2 text-gray-600 border-gray-500 rounded"
              value={e.accountId}
              onChange={(ev) => updateEntry(i, "accountId", ev.target.value)}
            >
              <option value="">Select Account</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="border p-2 text-gray-600 border-gray-500 rounded"
              value={e.debit || ""}
              onChange={(ev) => updateEntry(i, "debit", ev.target.value)}
            />

            <input
              type="number"
              className="border p-2 text-gray-600 border-gray-500 rounded"
              value={e.credit || ""}
              onChange={(ev) => updateEntry(i, "credit", ev.target.value)}
            />

            <button
              onClick={() => removeRow(i)}
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
        {/* Totals */}
        <div className="flex justify-between bg-gray-100 p-3 rounded">
          <div className="text-green-600">
            Debit: ${totalDebit.toLocaleString()}
          </div>
          <div className="text-green-600">
            Credit: ${totalCredit.toLocaleString()}
          </div>
        </div>
        {/* Status */}
        <div
          className={`text-sm font-medium ${
            isBalanced ? "text-green-600" : "text-red-600"
          }`}
        >
          {isBalanced ? "Balanced ✓" : `Difference: $${Math.abs(difference)}`}
        </div>
        {/* Actions */}
        <div className="flex justify-between">
          <div className="space-x-3">
            <button onClick={addRow} className="text-blue-600">
              + Add Row
            </button>

            <button onClick={autoBalance} className="text-green-600">
              ⚡ Auto Balance
            </button>
          </div>

          <div className="space-x-3">
            <button
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={!isBalanced}
              onClick={handleSubmit}
              className={`px-4 py-2 rounded text-white ${
                isBalanced ? "bg-[#0F172A]" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
