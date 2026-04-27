"use client";

import { motion } from "framer-motion";

type Props = {
  customer: any;
  onClose: () => void;
};

export default function CustomerDrawer({ customer, onClose }: Props) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        className="w-full max-w-md bg-white h-full p-6 space-y-4"
      >
        <div className="flex justify-between">
          <h2 className="text-lg font-bold text-gray-600">{customer.name}</h2>
          <button className="text-red-500" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-gray-400">Email: {customer.email || "—"}</p>
          <p className="text-gray-400">Phone: {customer.phone || "—"}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2 text-gray-600">Invoices</h3>

          {customer.invoices?.length ?
            <div className="space-y-2">
              {customer.invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-2 border rounded text-sm flex justify-between"
                >
                  <span>${inv.amount}</span>
                  <span className="text-gray-500">{inv.status}</span>
                </div>
              ))}
            </div>
          : <p className="text-gray-400 text-sm">No invoices yet</p>}
        </div>
      </motion.div>
    </div>
  );
}
