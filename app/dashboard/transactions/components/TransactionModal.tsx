"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Entry = {
  accountId: string;
  debit: number;
  credit: number;
};

export default function TransactionModal({
  accounts = [],
  onClose,
  onSuccess,
}: any) {
  const [description, setDescription] = useState("");

  const [entries, setEntries] = useState<Entry[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ]);

  //////////////////////////////////////////////////////
  // UPDATE ENTRY
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
  // ADD ROW
  //////////////////////////////////////////////////////
  const addRow = () => {
    setEntries([...entries, { accountId: "", debit: 0, credit: 0 }]);
  };

  //////////////////////////////////////////////////////
  // REMOVE ROW
  //////////////////////////////////////////////////////
  const removeRow = (index: number) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  //////////////////////////////////////////////////////
  // CALCULATIONS
  //////////////////////////////////////////////////////
  const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);

  const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

  const difference = totalDebit - totalCredit;

  const isBalanced = difference === 0;

  //////////////////////////////////////////////////////
  // AUTO BALANCE
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
  // SUBMIT
  //////////////////////////////////////////////////////
  const handleSubmit = async () => {
    if (!isBalanced) {
      return alert("Transaction not balanced");
    }

    if (entries.some((e) => !e.accountId)) {
      return alert("All rows must have an account");
    }

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          description,
          entries,
        }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="border-b px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              Journal Entry
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create balanced accounting transactions
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </label>

            <input
              placeholder="Enter transaction description"
              className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none text-gray-700 p-3 rounded-lg text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block border rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 text-gray-600 text-sm font-semibold px-4 py-3">
              <div className="col-span-5">Account</div>
              <div className="col-span-3">Debit</div>
              <div className="col-span-3">Credit</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
              {entries.map((e, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 px-4 py-3 items-center"
                >
                  <div className="col-span-5">
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700"
                      value={e.accountId}
                      onChange={(ev) =>
                        updateEntry(i, "accountId", ev.target.value)
                      }
                    >
                      <option value="">Select Account</option>

                      {accounts.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700"
                      value={e.debit || ""}
                      onChange={(ev) =>
                        updateEntry(i, "debit", ev.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700"
                      value={e.credit || ""}
                      onChange={(ev) =>
                        updateEntry(i, "credit", ev.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeRow(i)}
                      className="text-red-500 hover:text-red-700 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {entries.map((e, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 space-y-3 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700 text-sm">
                    Entry #{i + 1}
                  </p>

                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <select
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 bg-white"
                  value={e.accountId}
                  onChange={(ev) =>
                    updateEntry(i, "accountId", ev.target.value)
                  }
                >
                  <option value="">Select Account</option>

                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Debit"
                    className="border border-gray-300 rounded-lg p-3 text-sm text-gray-700 bg-white"
                    value={e.debit || ""}
                    onChange={(ev) => updateEntry(i, "debit", ev.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Credit"
                    className="border border-gray-300 rounded-lg p-3 text-sm text-gray-700 bg-white"
                    value={e.credit || ""}
                    onChange={(ev) => updateEntry(i, "credit", ev.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium">Total Debit</p>

              <p className="text-xl font-bold text-green-700">
                ${totalDebit.toLocaleString()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Total Credit</p>

              <p className="text-xl font-bold text-blue-700">
                ${totalCredit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div
            className={`rounded-xl p-4 text-sm font-medium border ${
              isBalanced ?
                "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {isBalanced ?
              "✓ Transaction is balanced"
            : `Difference: $${Math.abs(difference).toLocaleString()}`}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-4 sm:p-5 bg-gray-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={addRow}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Row
              </button>

              <button
                onClick={autoBalance}
                className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                ⚡ Auto Balance
              </button>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>

              <button
                disabled={!isBalanced}
                onClick={handleSubmit}
                className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition ${
                  isBalanced ?
                    "bg-[#0F172A] hover:bg-black"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
