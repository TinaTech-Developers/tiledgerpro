"use client";

import html2pdf from "html2pdf.js";

export default function QuotationPDFButton() {
  const generatePDF = () => {
    const element = document.getElementById("quotation");

    if (!element) {
      alert("Quotation not found");
      return;
    }

    const opt = {
      margin: 0,
      filename: "quotation.pdf",

      image: {
        type: "jpeg" as const,
        quality: 0.98,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait" as const, // ✅ FIX HERE
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch((err: any) => {
        console.error("PDF ERROR:", err);
      });
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Download PDF
    </button>
  );
}
