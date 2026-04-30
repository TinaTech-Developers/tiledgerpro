"use client";

export default function AccountTable({ accounts, onEdit, onDelete }: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-600">
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3 p-3">
        {accounts.map((acc: any) => (
          <div
            key={acc.id}
            className="border rounded-lg p-4 space-y-2 shadow-sm"
          >
            <div className="flex justify-between">
              <p className="font-semibold text-gray-700">{acc.name}</p>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {acc.type}
              </span>
            </div>

            <p className="text-gray-600">
              Balance:{" "}
              <span className="font-semibold">
                ${acc.balance.toLocaleString()}
              </span>
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => onEdit(acc)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(acc.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-center text-gray-500 p-6">No accounts found</div>
        )}
      </div>
    </div>
  );
}
