"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  price: number;
};

type Customer = {
  id: string;
  name: string;
};

type Props = {
  customers: Customer[];
  products?: Product[];
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
};

type Item = {
  productId: string;
  description: string;
  quantity: number;
  price: number;
};

export default function InvoiceModal({
  customers,
  products = [],
  onClose,
  onSuccess,
  organizationId,
}: Props) {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [taxRate] = useState(0.15);

  const [items, setItems] = useState<Item[]>([
    { productId: "", description: "", quantity: 1, price: 0 },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", description: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof Item>(
    index: number,
    field: K,
    value: Item[K],
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);

    setItems((prev) =>
      prev.map((item, i) =>
        i === index ?
          {
            ...item,
            productId,
            price: product?.price || 0,
            description: product?.name || "",
          }
        : item,
      ),
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!customerId) return alert("Select customer");

    const validItems = items.filter(
      (i) => i.productId && i.quantity > 0 && i.price > 0,
    );

    if (!validItems.length) return alert("Add valid item");

    setLoading(true);

    try {
      await apiFetch("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          organizationId,
          dueDate: new Date().toISOString(),
          subtotal,
          tax,
          totalAmount: total,
          items: validItems,
        }),
      });

      onSuccess();
      onClose();
    } catch {
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl p-4 md:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold">Create Invoice</h2>
          <p className="text-sm text-gray-500">Invoice auto-generated</p>
        </div>

        {/* CUSTOMER */}
        <select
          className="w-full border p-3 rounded-lg"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* ITEMS */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 border p-3 rounded-lg"
            >
              <select
                className="border p-2 rounded"
                value={item.productId}
                onChange={(e) => handleProductChange(i, e.target.value)}
              >
                <option value="">Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                className="border p-2 rounded"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />

              <input
                type="number"
                className="border p-2 rounded"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
              />

              <input
                type="number"
                className="border p-2 rounded"
                value={item.price}
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
              />

              <div className="text-right font-medium flex items-center justify-end">
                ${(item.quantity * item.price).toFixed(2)}
              </div>

              <button
                onClick={() => removeItem(i)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* ADD ITEM */}
        <button onClick={addItem} className="text-blue-600 text-sm">
          + Add Item
        </button>

        {/* SUMMARY */}
        <div className="border-t pt-4 flex justify-center md:justify-end">
          <div className="w-full md:w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full md:w-auto border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
