"use client";

import { useRouter } from "next/navigation";

export default function QuotationTable({ data }: any) {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Quotation</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {data?.length ?
              data.map((q: any) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-700">{q.id.slice(0, 8)}</td>

                  <td className="p-3 text-gray-600">
                    {q.customer?.name || "Walk-in"}
                  </td>

                  <td className="p-3 text-gray-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        q.status === "APPROVED" ? "bg-green-100 text-green-700"
                        : q.status === "REJECTED" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  <td className="p-3 text-right text-gray-600 font-semibold">
                    ${q.totalAmount}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/quotations/${q.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            : <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No quotations found
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {data?.length ?
          data.map((q: any) => (
            <div
              key={q.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between">
                <p className="font-semibold text-gray-700">
                  #{q.id.slice(0, 8)}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    q.status === "APPROVED" ? "bg-green-100 text-green-700"
                    : q.status === "REJECTED" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {q.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {q.customer?.name || "Walk-in"}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(q.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-between mt-3">
                <p className="font-semibold text-gray-800">${q.totalAmount}</p>

                <button
                  onClick={() => router.push(`/dashboard/quotations/${q.id}`)}
                  className="text-blue-600 text-sm"
                >
                  View →
                </button>
              </div>
            </div>
          ))
        : <p className="text-center text-gray-500">No quotations found</p>}
      </div>
    </div>
  );
}
