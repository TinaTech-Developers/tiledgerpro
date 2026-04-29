"use client";

import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Accounts", href: "/dashboard/accounts" },
  { name: "Transactions", href: "/dashboard/transactions" },
  { name: "Invoices", href: "/dashboard/invoices" },
  { name: "Payments", href: "/dashboard/payments" },
  { name: "Bills", href: "/dashboard/bills" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Customers", href: "/dashboard/customers" },
  { name: "Vendors", href: "/dashboard/vendors" },
];

export default function Sidebar({
  closeSidebar,
}: {
  closeSidebar?: () => void;
}) {
  return (
    <aside className="w-64 h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        LedgerPro
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeSidebar}
            className="block px-4 py-2 rounded-lg hover:bg-[#1E293B] transition"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © 2026 LedgerPro
      </div>
    </aside>
  );
}
