"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  initial?: any;
};

export default function CustomerModal({ onClose, onSuccess, initial }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return alert("Name is required");

    setLoading(true);

    try {
      await apiFetch("/api/customers", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold">Customer</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0F172A] text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
