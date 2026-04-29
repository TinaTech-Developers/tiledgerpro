import React from "react";

export default function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
    </div>
  );
}
