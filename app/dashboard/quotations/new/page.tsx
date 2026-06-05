"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import QuotationForm from "../_components/QuotationForm";

export default function NewQuotationPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";
  useEffect(() => {
    Promise.all([
      apiFetch(`/api/customers?organizationId=${organizationId}`),

      apiFetch(`/api/products?organizationId=${organizationId}`),
    ]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Create Quotation</h1>

      <QuotationForm customers={customers} products={products} />
    </div>
  );
}
