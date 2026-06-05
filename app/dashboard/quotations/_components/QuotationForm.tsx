"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Item = {
  productId?: string;
  description: string;
  quantity: number;
  price: number;
};

export default function QuotationForm({ customers, products }: any) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, price: 0 },
  ]);

  const addRow = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (i: number, field: keyof Item, value: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    setItems(updated);
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleSubmit = async () => {
    await apiFetch("/api/quotations", {
      method: "POST",
      body: JSON.stringify({
        customerId,
        organizationId: "dec771e0-60bb-478e-86a0-9bf2f5bb2636",
        items,
      }),
    });

    alert("Quotation created");
  };

  return (
    <div className="bg-white p-6 rounded-xl space-y-4 shadow">
      {/* CUSTOMER */}
      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        className="border p-2 w-full text-gray-700 border-gray-300"
      >
        <option value="">Select Customer</option>
        {customers.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="Service / Product"
            value={item.description}
            onChange={(e) => updateItem(i, "description", e.target.value)}
            className="border p-2 text-gray-600 border-gray-300"
          />

          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
            className="border p-2 text-gray-600 border-gray-300"
          />

          <input
            type="number"
            value={item.price}
            onChange={(e) => updateItem(i, "price", Number(e.target.value))}
            className="border p-2 text-gray-600 border-gray-300"
          />

          <div className="flex items-center justify-between">
            <span>${item.quantity * item.price}</span>

            <button
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button onClick={addRow} className="text-blue-600">
        + Add Row
      </button>

      {/* TOTAL */}
      <div className="text-right font-bold text-lg text-gray-800">
        Total: ${total}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Quotation
      </button>
    </div>
  );
}
