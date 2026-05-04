"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import QuotationPreview from "../_components/QuotationPreview";
import { downloadPDF } from "@/lib/downloadPDF";

export default function QuotationViewPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/api/quotations?id=${id}`).then((data) => {
      if (!data?.error) setQuotation(data);
    });
  }, [id]);

  if (!quotation) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen space-y-4">
      {/* ================= ACTION BAR ================= */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* ZOOM (ONLY ON DESKTOP) */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(60, z - 10))}
            className="px-3 py-1 border rounded bg-white"
          >
            -
          </button>

          <button
            onClick={() => setZoom(100)}
            className="px-3 py-1 border rounded bg-white"
          >
            Reset
          </button>

          <button
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="px-3 py-1 border rounded bg-white"
          >
            +
          </button>
        </div>

        <button
          onClick={() => downloadPDF("pdf")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* ================= VIEWER ================= */}

      {/* MOBILE: scroll mode */}
      <div className="block md:hidden overflow-auto bg-white rounded-lg shadow">
        <div className="min-w-[210mm]">
          <QuotationPreview quotation={quotation} />
        </div>
      </div>

      {/* DESKTOP: centered A4 */}
      <div className="hidden md:flex justify-center">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <QuotationPreview quotation={quotation} />
        </div>
      </div>
    </div>
  );
}
