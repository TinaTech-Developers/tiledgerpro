"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import QuotationPreview from "../_components/QuotationPreview";
import { downloadPDF } from "@/lib/downloadPDF";

export default function QuotationViewPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/api/quotations?id=${id}`).then((data) => {
      if (data?.error) {
        console.error(data.error);
        return;
      }
      setQuotation(data);
    });
  }, [id]);

  if (!quotation) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => downloadPDF("pdf")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      <QuotationPreview quotation={quotation} />
    </div>
  );
}
