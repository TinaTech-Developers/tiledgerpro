"use client";

import Image from "next/image";
import React from "react";

export default function InvoicePrintView({ invoice, company }: any) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = invoice.items || [];

  return (
    <>
      {/* PRINT BUTTON (hidden in print) */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Print Invoice
        </button>
      </div>

      {/* INVOICE A4 */}
      <div
        id="invoice-a4"
        className="bg-white p-10 mx-auto shadow-lg text-black print:shadow-none"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* HEADER */}
        <div className="flex justify-between mb-10 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-500">INVOICE</h1>

            <p className="text-gray-500">Invoice #: {invoice.invoiceNumber}</p>

            <p className="text-gray-500">
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>

            <p className="text-gray-500">
              Status: <span className="font-semibold">{invoice.status}</span>
            </p>
          </div>

          <div className="text-right">
            {company?.logoUrl && (
              <Image
                src={company.logoUrl}
                alt="Logo"
                width={120}
                height={50}
                className="mb-2 ml-auto"
              />
            )}

            <h2 className="text-lg font-bold">{company?.name}</h2>
            <p className="text-sm text-gray-600">{company?.address}</p>
            <p className="text-sm text-gray-600">{company?.email}</p>
            <p className="text-sm text-gray-600">{company?.phone}</p>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{invoice.customer?.name}</p>
          <p className="text-gray-600 text-sm">{invoice.customer?.email}</p>
        </div>

        {/* ITEMS */}
        <table className="w-full border text-sm mb-10">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Description</th>
              <th className="border p-3 text-left">Qty</th>
              <th className="border p-3 text-left">Price</th>
              <th className="border p-3 text-left">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={i}>
                <td className="border p-3">{item.description}</td>
                <td className="border p-3">{item.quantity}</td>
                <td className="border p-3">${item.price}</td>
                <td className="border p-3">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${invoice.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>${invoice.tax}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${invoice.totalAmount}</span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span>Status</span>
              <span>{invoice.status}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-20 text-sm text-gray-500 text-center border-t pt-4">
          Thank you for doing business with {company?.name}
        </div>
      </div>
    </>
  );
}
