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
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
              className="border-t hover:bg-gray-50 transition cursor-pointer"
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
  );
}
