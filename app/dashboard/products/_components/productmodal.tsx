"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function ProductModal({
  onClose,
  onSuccess,
  organizationId,
  product,
}: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    stock: 0,
    price: "",
    status: "IN_STOCK",
    imageUrl: "",
  });

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || 0,
        status: product.status || "IN_STOCK",
        imageUrl: product.imageUrl || "",
      });
    }
  }, [product]);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required");
      return;
    }

    await apiFetch(
      isEditing ? `/api/products/${product.id}` : `/api/products`,
      {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          organizationId,
        }),
      },
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4 shadow-lg">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Product" : "New Product"}
        </h2>

        {/* NAME */}
        <input
          placeholder="Product name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* PRICE */}
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock quantity"
          className="w-full border p-2 rounded"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />

        {/* IMAGE */}
        <input
          placeholder="Image URL"
          className="w-full border p-2 rounded"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />

        {/* STATUS */}
        <select
          className="w-full border p-2 rounded"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="IN_STOCK">In Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded"
          >
            {isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
