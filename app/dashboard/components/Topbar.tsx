"use client";

export default function Topbar() {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative">
          🔔
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
          <span className="text-sm text-gray-700">User</span>
        </div>
      </div>
    </header>
  );
}
