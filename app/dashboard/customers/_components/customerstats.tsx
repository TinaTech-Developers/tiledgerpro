"use client";

type Props = {
  total: number;
  newThisMonth: number;
  active: number;
  owing: number;
};

export default function CustomerStats({
  total,
  newThisMonth,
  active,
  owing,
}: Props) {
  const cards = [
    { label: "Total Customers", value: total },
    { label: "New This Month", value: newThisMonth },
    { label: "Active", value: active },
    { label: "Owing", value: owing },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-gray-500 text-sm">{c.label}</p>
          <h2 className="text-xl font-bold text-gray-800">{c.value}</h2>
        </div>
      ))}
    </div>
  );
}
