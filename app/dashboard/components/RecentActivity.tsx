import React from "react";

export default function RecentActivity({ activities }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-700">Recent Activity</h2>

      <div className="space-y-3">
        {activities.map((a: any) => (
          <div
            key={a.id}
            className="flex justify-between text-sm border-b pb-2"
          >
            <div>
              <p className="text-gray-700">{a.description}</p>
              <p className="text-gray-400">{a.type}</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">${a.amount}</p>
              <p className="text-gray-400 text-xs">
                {new Date(a.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
