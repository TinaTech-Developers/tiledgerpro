"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AddBillModal({
  vendors = [],
  accounts = [],
  organizationId,
  onClose,
  onSuccess,
}: any) {
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [vendorId, setVendorId] = useState("");
  //   const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!vendorId) return alert("Select vendor");
    // if (!accountId) return alert("Select AP account");
    if (!amount || amount <= 0) return alert("Enter valid amount");

    setLoading(true);

    try {
      await apiFetch("/api/bills", {
        method: "POST",
        body: JSON.stringify({
          vendorId,
          organizationId,
          totalAmount: amount,
          dueDate,

          createdById: "USER_ID", // replace later
          description,
        }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4 shadow-xl">
        <h2 className="text-xl font-bold">Add Bill</h2>

        {/* Vendor */}
        <select
          className="w-full border p-2 rounded"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
        >
          <option value="">Select Vendor</option>
          {safeVendors.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Account (AP only ideally) */}

        {/* Amount */}
        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        {/* Due Date */}
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}
