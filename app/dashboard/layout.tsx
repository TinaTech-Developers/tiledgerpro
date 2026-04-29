"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Sidebar (mobile overlay) */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="relative z-50">
            <Sidebar closeSidebar={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}