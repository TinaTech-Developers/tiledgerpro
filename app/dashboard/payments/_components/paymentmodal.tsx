"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function PaymentModal({
  invoices = [],
  bills = [],
  accounts = [],
  organizationId,
  onClose,
  onSuccess,
}: any) {
  // ✅ SAFE ARRAYS (prevents "find is not a function")
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeBills = Array.isArray(bills) ? bills : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [type, setType] = useState<"INVOICE" | "BILL">("INVOICE");
  const [invoiceId, setInvoiceId] = useState("");
  const [billId, setBillId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // =========================
  // SELECTED INVOICE
  // =========================
  const selectedInvoice = useMemo(() => {
    return safeInvoices.find((i: any) => i.id === invoiceId);
  }, [invoiceId, safeInvoices]);

  // =========================
  // SELECTED BILL
  // =========================
  const selectedBill = useMemo(() => {
    return safeBills.find((b: any) => b.id === billId);
  }, [billId, safeBills]);

  // =========================
  // AUTO AMOUNT SUGGESTION
  // =========================
  const suggestedAmount =
    type === "INVOICE" ?
      selectedInvoice?.totalAmount || 0
    : selectedBill?.totalAmount || 0;

  // =========================
  // SUBMIT PAYMENT
  // =========================
  const handleSubmit = async () => {
    if (!accountId) return alert("Select account");
    if (type === "INVOICE" && !invoiceId) return alert("Select invoice");
    if (type === "BILL" && !billId) return alert("Select bill");
    if (amount <= 0) return alert("Enter valid amount");

    setLoading(true);

    try {
      await apiFetch("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: type === "INVOICE" ? invoiceId : null,
          billId: type === "BILL" ? billId : null,
          accountId,
          amount,
          organizationId,
          createdById: "fbcc1c58-2cf3-4d0f-88d1-e3461eba7bf8", // replace with auth later
        }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800">New Payment</h2>

        {/* TYPE */}
        <select
          className="w-full border border-gray-300 text-gray-600 p-2 rounded"
          value={type}
          onChange={(e) => {
            setType(e.target.value as any);
            setInvoiceId("");
            setBillId("");
            setAmount(0);
          }}
        >
          <option value="INVOICE">Customer Payment</option>
          <option value="BILL">Bill Payment</option>
        </select>

        {/* SOURCE */}
        {type === "INVOICE" ?
          <select
            className="w-full border border-gray-300 text-gray-600 p-2 rounded"
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value);
              const inv = safeInvoices.find(
                (i: any) => i.id === e.target.value,
              );
              setAmount(inv?.totalAmount || 0);
            }}
          >
            <option value="">Select Invoice</option>
            {safeInvoices.map((i: any) => (
              <option key={i.id} value={i.id}>
                {i.invoiceNumber} - ${i.totalAmount}
              </option>
            ))}
          </select>
        : <select
            className="w-full border border-gray-300 text-gray-600 p-2 rounded"
            value={billId}
            onChange={(e) => {
              setBillId(e.target.value);
              const bill = safeBills.find((b: any) => b.id === e.target.value);
              setAmount(bill?.totalAmount || 0);
            }}
          >
            <option value="">Select Bill</option>
            {safeBills.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.id} - ${b.totalAmount}
              </option>
            ))}
          </select>
        }

        {/* ACCOUNT */}
        <select
          className="w-full border border-gray-300 text-gray-600 p-2 rounded"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Select Account</option>
          {safeAccounts.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.type})
            </option>
          ))}
        </select>

        {/* AMOUNT */}
        <input
          type="number"
          className="w-full border border-gray-300 text-gray-600 p-2 rounded"
          placeholder={`Amount (suggested: $${suggestedAmount})`}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        {/* SUGGESTION */}
        {suggestedAmount > 0 && (
          <p className="text-xs text-gray-500">
            Suggested amount: ${suggestedAmount}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 border bg-red-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
