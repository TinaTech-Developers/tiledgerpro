"use client";

export default function AccountTable({ accounts, onEdit, onDelete }: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Balance</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map((acc: any) => (
            <tr key={acc.id} className="border-t">
              <td className="p-3 text-gray-700">{acc.name}</td>
              <td className="p-3 text-gray-700">{acc.type}</td>
              <td className="p-3 text-gray-700 font-semibold">
                ${acc.balance.toLocaleString()}
              </td>

              <td className="p-3 text-right space-x-3">
                <button onClick={() => onEdit(acc)} className="text-blue-600">
                  Edit
                </button>

                <button
                  onClick={() => onDelete(acc.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {accounts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
                No accounts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
