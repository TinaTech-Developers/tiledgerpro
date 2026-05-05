"use client";

import { useEffect, useState } from "react";
import InvoiceTable from "./components/invoicetable";
import InvoiceModal from "./components/invoicemodal";
import { apiFetch } from "@/lib/api";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  const fetchData = async () => {
    try {
      const [invRes, custRes, prodRes] = await Promise.allSettled([
        apiFetch("/api/invoices"),
        apiFetch("/api/customers"),
        apiFetch(`/api/products?organizationId=${organizationId}`),
      ]);

      if (invRes.status === "fulfilled") {
        setInvoices(Array.isArray(invRes.value) ? invRes.value : []);
      }

      if (custRes.status === "fulfilled") {
        setCustomers(Array.isArray(custRes.value) ? custRes.value : []);
      }

      if (prodRes.status === "fulfilled") {
        setProducts(Array.isArray(prodRes.value) ? prodRes.value : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Invoices
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto bg-[#0F172A] text-white px-4 py-2 rounded-lg"
        >
          + New Invoice
        </button>
      </div>

      {/* TABLE WRAPPER (IMPORTANT FOR MOBILE SCROLL) */}
      <div className="bg-white rounded-xl shadow border">
        <InvoiceTable invoices={invoices} />
      </div>

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
