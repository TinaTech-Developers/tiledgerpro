"use client";

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
};

type Props = {
  customers: Customer[];
  onSelect: (c: Customer) => void;
  onEdit: (c: Customer) => void;
};

export default function CustomerTable({ customers, onSelect, onEdit }: Props) {
  return (
    <div className="w-full">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(c)}
              >
                <td className="p-4 font-medium text-gray-600">{c.name}</td>
                <td className="p-4 text-gray-600">{c.email || "—"}</td>
                <td className="p-4 text-gray-600">{c.phone || "—"}</td>
                <td className="p-4 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td
                  className="p-4 text-right space-x-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelect(c)}
                    className="text-blue-600 text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onEdit(c)}
                    className="text-gray-600 text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-3 p-3">
        {customers.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between">
              <p className="font-semibold text-gray-700">{c.name}</p>
              <span className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-600">{c.email || "—"}</p>
            <p className="text-sm text-gray-600">{c.phone || "—"}</p>

            <div className="flex gap-4 mt-3">
              <button
                onClick={() => onSelect(c)}
                className="text-blue-600 text-sm"
              >
                View
              </button>

              <button
                onClick={() => onEdit(c)}
                className="text-gray-600 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <p className="text-center text-gray-500 p-6">No customers found</p>
        )}
      </div>
    </div>
  );
}
