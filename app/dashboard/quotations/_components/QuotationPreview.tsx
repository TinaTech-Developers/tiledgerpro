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
      id="quotation"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontSize: "12px",
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <div>
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            loading="eager"
            style={{ width: "auto", height: "auto", marginBottom: 10 }}
          />

          <p style={{ color: "#4b5563" }}>+263 712 471 209</p>
          <p style={{ color: "#4b5563" }}>+263 773 059 753</p>
          <p style={{ color: "#4b5563" }}>sales@tinasoftnexus.co.zw</p>
          <p style={{ color: "#4b5563" }}>Belvedere, Harare</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <h1 style={{ fontSize: 22, fontWeight: "bold" }}>QUOTATION</h1>

          <p>
            <strong>No:</strong> {quotation.id?.slice(0, 8)}
          </p>

          <p style={{ color: "#6b7280" }}>
            <strong>Date:</strong>{" "}
            {new Date(quotation.createdAt).toLocaleDateString()}
          </p>

          <p style={{ color: "#6b7280" }}>
            <strong>Status:</strong> {quotation.status}
          </p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Quote To:</h3>

        <p style={{ fontWeight: 500 }}>
          {quotation.customer?.name || "Walk-in Customer"}
        </p>

        {quotation.customer?.phone && (
          <p style={{ color: "#6b7280" }}>Phone: {quotation.customer.phone}</p>
        )}

        {quotation.customer?.email && (
          <p style={{ color: "#6b7280" }}>Email: {quotation.customer.email}</p>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}
      >
        <thead>
          <tr style={{ backgroundColor: "#e5e7eb" }}>
            <th style={th}>Description</th>
            <th style={th}>Qty</th>
            <th style={th}>Price</th>
            <th style={th}>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ?
            items.map((item: any) => (
              <tr key={item.id}>
                <td style={td}>
                  {item.description || item.product?.name || "Service"}
                </td>
                <td style={tdCenter}>{item.quantity}</td>
                <td style={tdCenter}>{item.price.toFixed(2)}</td>
                <td style={tdRight}>
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))
          : <tr>
              <td colSpan={4} style={{ padding: 10, textAlign: "center" }}>
                No items found
              </td>
            </tr>
          }
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 30,
        }}
      >
        <div
          style={{ width: 250, borderTop: "1px solid #d1d5db", paddingTop: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ================= TERMS & CONDITIONS (RESTORED) ================= */}
      <div style={{ fontSize: 11, color: "#374151", marginBottom: 40 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 5 }}>Terms & Conditions</h4>

        <p>• 40% deposit required before project start.</p>
        <p>• Valid for 30 days from issue date.</p>
        <p>• Services commence upon confirmation.</p>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#6b7280",
        }}
      >
        <div>
          <p>Signature: _______________________</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p>Thank you for your business</p>
          <p style={{ fontWeight: 600 }}>TinaSoft Nexus</p>
        </div>
      </div>
    </div>
  );
}

/* SAFE TABLE STYLES */
const th: any = {
  border: "1px solid #d1d5db",
  padding: 8,
  textAlign: "left",
};

const td: any = {
  border: "1px solid #d1d5db",
  padding: 8,
};

const tdCenter: any = {
  ...td,
  textAlign: "center",
};

const tdRight: any = {
  ...td,
  textAlign: "right",
};
