"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function VendorModal({
  vendor,
  onClose,
  onSuccess,
  organizationId,
}: any) {
  const isEdit = !!vendor;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name || "");
      setEmail(vendor.email || "");
      setPhone(vendor.phone || "");
    }
  }, [vendor]);

  const submit = async () => {
    if (!name) return alert("Name is required");

    setLoading(true);

    try {
      if (isEdit) {
        await apiFetch(`/api/vendors?id=${vendor.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, email, phone }),
        });
      } else {
        await apiFetch("/api/vendors", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            phone,
            organizationId, // ✅ FIXED
          }),
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-bold">
          {isEdit ? "Edit Vendor" : "New Vendor"}
        </h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Vendor name"
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

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ?
              "Saving..."
            : isEdit ?
              "Update"
            : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
