"use client";

import Image from "next/image";

export default function QuotationPreview({ quotation }: any) {
  if (!quotation) return null;

  const items = quotation?.quotationItems || [];

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity || 0) * (item.price || 0);
  }, 0);

  return (
    <div
      id="pdf"
      className="bg-white text-sm mx-auto shadow"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
      }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between mb-10">
        <div>
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="mb-3"
          />

          <p className="text-gray-600">+263 712 471 209</p>
          <p className="text-gray-600">+263 773 059 753</p>
          <p className="text-gray-600">sales@tinasoftnexus.co.zw</p>
          <p className="text-gray-600">Belvedere, Harare</p>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-800">QUOTATION</h1>

          <p className="mt-2 text-gray-700">
            <strong>No:</strong> {quotation.id?.slice(0, 8)}
          </p>

          <p className="text-gray-600">
            <strong>Date:</strong>{" "}
            {new Date(quotation.createdAt).toLocaleDateString()}
          </p>

          <p className="text-gray-600">
            <strong>Status:</strong> {quotation.status}
          </p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2 text-gray-700">Quote To:</h3>

        <p className="font-medium text-gray-500">
          {quotation.customer?.name || "Walk-in Customer"}
        </p>

        {quotation.customer?.phone && (
          <p className="text-gray-500">Phone: {quotation.customer.phone}</p>
        )}

        {quotation.customer?.email && (
          <p className="text-gray-500">Email: {quotation.customer.email}</p>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 border-gray-300 text-gray-800 text-left">
              Description (Product / Service)
            </th>
            <th className="border p-2 border-gray-300 text-gray-800">Qty</th>
            <th className="border p-2 border-gray-300 text-gray-800">Price</th>
            <th className="border p-2 border-gray-300 text-gray-800">Total</th>
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ?
            items.map((item: any) => (
              <tr key={item.id}>
                <td className="border p-2 text-gray-600 border-gray-300">
                  {item.description || item.product?.name || "Service"}
                </td>

                <td className="border p-2 text-gray-600 border-gray-300 text-center">
                  {item.quantity}
                </td>

                <td className="border p-2 text-gray-600 border-gray-300 text-center">
                  {item.price.toFixed(2)}
                </td>

                <td className="border p-2 text-gray-600 border-gray-300 text-right">
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))
          : <tr>
              <td
                colSpan={4}
                className="text-center text-gray-600 border-gray-300 p-4"
              >
                No items found
              </td>
            </tr>
          }
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div className="flex justify-end mb-10">
        <div className="w-64 border-t pt-3 border-gray-300">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg mt-2 text-gray-700">
            <span>Total</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ================= TERMS ================= */}
      <div className="mb-10 text-xs text-gray-700">
        <h4 className="font-semibold mb-1">Terms & Conditions</h4>

        <p>• 40% deposit required before project start.</p>
        <p>• Valid for 30 days from issue date.</p>
        <p>• Services commence upon confirmation.</p>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between mt-16 text-xs text-gray-600">
        <div>
          <p>Signature: _______________________</p>
        </div>

        <div className="text-right">
          <p>Thank you for your business</p>
          <p className="font-semibold">TinaSoft Nexus</p>
        </div>
      </div>
    </div>
  );
}
