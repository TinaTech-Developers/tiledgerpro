import React from "react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  bgColor?: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  bgColor = "bg-white",
}: SummaryCardProps) {
  return (
    <div
      className={`p-4 rounded-xl shadow-md ${bgColor} flex items-center justify-between`}
    >
      <div>
        <p className="text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-navyBlue mt-1">{value}</p>
      </div>
      {icon && <div className="text-navyBlue text-3xl">{icon}</div>}
    </div>
  );
}
