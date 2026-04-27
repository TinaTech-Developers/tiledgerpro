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

  const [taxRate] = useState(0.15); // 15% tax (you can make configurable)

  const [items, setItems] = useState<Item[]>([
    { productId: "", description: "", quantity: 1, price: 0 },
  ]);

  // ➕ Add item
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", description: "", quantity: 1, price: 0 },
    ]);
  };

  // ❌ Remove item
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ✏️ Update item
  const updateItem = <K extends keyof Item>(
    index: number,
    field: K,
    value: Item[K],
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // 🎯 Product selection
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

  // 💰 CALCULATIONS (REAL ACCOUNTING STYLE)
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const tax = subtotal * taxRate;

  const total = subtotal + tax;

  // 🚀 Submit
  const handleSubmit = async () => {
    if (!customerId) return alert("Select customer");

    const validItems = items.filter(
      (i) => i.productId && i.quantity > 0 && i.price > 0,
    );

    if (validItems.length === 0) {
      return alert("Add at least one valid item");
    }

    setLoading(true);

    try {
      await apiFetch("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          organizationId,
          dueDate: new Date().toISOString(),

          // 🔥 accounting fields
          subtotal,
          tax,
          totalAmount: total,

          items: validItems,
        }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-xl space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Invoice</h2>

          <div className="text-sm text-gray-500">
            Invoice will be generated automatically
          </div>
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

        {/* ITEMS HEADER */}
        <div className="grid grid-cols-6 text-xs font-semibold text-gray-500 uppercase">
          <div>Product</div>
          <div>Description</div>
          <div>Qty</div>
          <div>Price</div>
          <div>Total</div>
          <div></div>
        </div>

        {/* ITEMS */}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center">
              {/* PRODUCT */}
              <select
                className="border p-2 rounded"
                value={item.productId}
                onChange={(e) => handleProductChange(i, e.target.value)}
              >
                <option value="">Select</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* DESCRIPTION */}
              <input
                className="border p-2 rounded"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />

              {/* QTY */}
              <input
                type="number"
                min={1}
                className="border p-2 rounded"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
              />

              {/* PRICE */}
              <input
                type="number"
                className="border p-2 rounded"
                value={item.price}
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
              />

              {/* LINE TOTAL */}
              <div className="text-right font-medium">
                ${(item.quantity * item.price).toFixed(2)}
              </div>

              {/* REMOVE */}
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
        <button
          onClick={addItem}
          className="text-blue-600 text-sm hover:underline"
        >
          + Add Item
        </button>

        {/* SUMMARY (ACCOUNTING STYLE) */}
        <div className="border-t pt-4 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax (15%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
