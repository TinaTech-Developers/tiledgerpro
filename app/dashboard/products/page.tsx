"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductModal from "./_components/productmodal";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "IN_STOCK" | "OUT_OF_STOCK";
  imageUrl?: string;
  createdAt: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const fetchProducts = async () => {
    const data = await apiFetch(
      `/api/products?organizationId=${organizationId}`,
    );
    setProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FILTER + SEARCH + SORT
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (statusFilter === "ALL" ? true : p.status === statusFilter))
    .sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await apiFetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  // EDIT
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>

        <button
          onClick={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + New Product
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Search products..."
          className="border px-3 py-2 rounded-lg text-gray-500 border-gray-400 w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-lg text-gray-500 border-gray-400"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg text-gray-500 border-gray-400"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img
                    src={p.imageUrl || "/placeholder.png"}
                    className="w-10 h-10 rounded object-cover"
                  />

                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-gray-500 text-xs truncate max-w-xs">
                      {p.description}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 font-semibold text-gray-700">
                  ${p.price}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "IN_STOCK" ?
                        "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <ProductModal
          product={editingProduct} // 👈 THIS makes edit work
          organizationId={organizationId}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            fetchProducts();
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
