"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import QuotationPreview from "../_components/QuotationPreview";
import { downloadPDF } from "@/lib/downloadPDF";

export default function QuotationViewPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/api/quotations?id=${id}`).then((data) => {
      if (data?.error) return;
      setQuotation(data);
    });
  }, [id]);

  if (!quotation) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-4 md:p-6 space-y-4 bg-gray-100 min-h-screen">
      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* ZOOM CONTROLS */}
        <div className="flex gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="px-3 py-1 border rounded bg-white"
          >
            -
          </button>

          <button
            onClick={() => setScale(1)}
            className="px-3 py-1 border rounded bg-white"
          >
            Reset
          </button>

          <button
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
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

      {/* SCROLLABLE + ZOOMABLE A4 WRAPPER */}
      <div className="w-full overflow-auto border rounded-lg bg-gray-200 p-4">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          className="w-max mx-auto"
        >
          <QuotationPreview quotation={quotation} />
        </div>
      </div>
    </div>
  );
}
