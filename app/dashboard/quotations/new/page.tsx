"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import QuotationForm from "../_components/QuotationForm";

export default function NewQuotationPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([apiFetch("/api/customers"), apiFetch("/api/products")]).then(
      ([c, p]) => {
        setCustomers(c);
        setProducts(p);
      },
    );
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Quotation</h1>

      <QuotationForm customers={customers} products={products} />
    </div>
  );
}
