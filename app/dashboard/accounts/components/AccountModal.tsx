"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AccountModal({ account, onClose, onSuccess }: any) {
  const [name, setName] = useState(account?.name || "");
  const [type, setType] = useState(account?.type || "CASH");

  const handleSubmit = async () => {
    if (!name || !type) return alert("Fill all fields");

    if (account) {
      await apiFetch("/api/accounts", {
        method: "PUT",
        body: JSON.stringify({
          id: account.id,
          name,
          type,
        }),
      });
    } else {
      await apiFetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
        }),
      });
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-3">
      <div className="bg-white p-5 rounded-xl w-full sm:max-w-md space-y-4 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900">
          {account ? "Edit Account" : "New Account"}
        </h2>

        <input
          placeholder="Account Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 text-gray-700 rounded"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 text-gray-700 rounded"
        >
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE_MONEY">Mobile Money</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#0F172A] text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
