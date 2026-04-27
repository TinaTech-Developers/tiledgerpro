"use client";

import { useEffect, useState } from "react";
import InvoiceTable from "./components/invoicetable";
import InvoiceModal from "./components/invoicemodal";
import { apiFetch } from "@/lib/api";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // ✅ ONLY ONE
  const [open, setOpen] = useState(false);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636"; // replace later with auth

  const fetchData = async () => {
    try {
      const [invRes, custRes, prodRes] = await Promise.allSettled([
        apiFetch("/api/invoices"),
        apiFetch("/api/customers"),
        apiFetch(`/api/products?organizationId=${organizationId}`),
      ]);

      // ✅ invoices
      if (invRes.status === "fulfilled") {
        setInvoices(Array.isArray(invRes.value) ? invRes.value : []);
      } else {
        console.error("Invoices failed:", invRes.reason);
        setInvoices([]);
      }

      // ✅ customers
      if (custRes.status === "fulfilled") {
        setCustomers(Array.isArray(custRes.value) ? custRes.value : []);
      } else {
        console.error("Customers failed:", custRes.reason);
        setCustomers([]);
      }

      // ✅ products
      if (prodRes.status === "fulfilled") {
        setProducts(Array.isArray(prodRes.value) ? prodRes.value : []);
      } else {
        console.error("Products failed:", prodRes.reason);
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + New Invoice
        </button>
      </div>

      {/* TABLE */}
      <InvoiceTable invoices={invoices} />

      {/* MODAL */}
      {open && (
        <InvoiceModal
          customers={customers}
          products={products}
          organizationId={organizationId}
          onClose={() => setOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
