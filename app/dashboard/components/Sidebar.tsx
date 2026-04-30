"use client";

import Link from "next/link";
import { useState } from "react";

const menu = [
  { name: "Dashboard", href: "/dashboard" },

  {
    name: "Accounting",
    children: [
      { name: "Accounts", href: "/dashboard/accounts" },
      { name: "Transactions", href: "/dashboard/transactions" },
    ],
  },

  {
    name: "Sales",
    children: [
      { name: "Customers", href: "/dashboard/customers" },
      { name: "Invoices", href: "/dashboard/invoices" },
      { name: "Payments", href: "/dashboard/payments" },
      { name: "Quotations", href: "/dashboard/quotes" },
    ],
  },

  {
    name: "Purchases",
    children: [
      { name: "Vendors", href: "/dashboard/vendors" },
      { name: "Bills", href: "/dashboard/bills" },
      { name: "Expenses", href: "/dashboard/expenses" },
    ],
  },

  {
    name: "Inventory",
    children: [
      { name: "Products", href: "/dashboard/products" },
      { name: "Stock", href: "/dashboard/stock" },
    ],
  },

  { name: "Banking", href: "/dashboard/banking" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar({
  closeSidebar,
}: {
  closeSidebar?: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  return (
    <aside className="w-64 h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        LedgerPro
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          // 🔹 If item has children (dropdown)
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex justify-between items-center px-4 py-2 rounded-lg hover:bg-[#1E293B] transition"
                >
                  {item.name}
                  <span>{openMenu === item.name ? "−" : "+"}</span>
                </button>

                {/* Dropdown */}
                {openMenu === item.name && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={closeSidebar}
                        className="block px-4 py-2 text-sm rounded-lg text-gray-300 hover:bg-[#1E293B]"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // 🔹 Normal link
          return (
            <Link
              key={item.name}
              href={item.href!}
              onClick={closeSidebar}
              className="block px-4 py-2 rounded-lg hover:bg-[#1E293B] transition"
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © 2026 LedgerPro
      </div>
    </aside>
  );
}
