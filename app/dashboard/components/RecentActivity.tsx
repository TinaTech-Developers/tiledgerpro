// app/dashboard/components/RecentActivity.tsx
import React from "react";

interface Activity {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-bold text-navyBlue mb-4">Recent Activity</h2>
      <ul className="divide-y divide-gray-200">
        {activities.map((act) => (
          <li key={act.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="text-gray-700 font-medium">{act.description}</p>
              <p className="text-gray-400 text-sm">{act.type}</p>
            </div>
            <div className="text-gray-700 font-semibold">
              ${act.amount.toLocaleString()}
              <p className="text-gray-400 text-sm">
                {new Date(act.date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
