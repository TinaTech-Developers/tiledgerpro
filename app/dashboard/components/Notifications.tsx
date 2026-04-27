"use client";

interface Notification {
  id: string;
  message: string;
}

export default function Notifications({ items }: { items: Notification[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Alerts</h2>

      {items.length === 0 ?
        <p className="text-gray-500 text-sm">No alerts</p>
      : <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
            >
              {n.message}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
