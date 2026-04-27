"use client";

import { useEffect, useState } from "react";
import AccountTable from "./components/AccountTable";
import AccountModal from "./components/AccountModal";
import { apiFetch } from "@/lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const fetchAccounts = async () => {
    const data = await apiFetch("/api/accounts");
    setAccounts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Accounts</h1>

        <button
          onClick={() => {
            setSelectedAccount(null);
            setShowModal(true);
          }}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg"
        >
          + New Account
        </button>
      </div>

      {/* Table */}
      <AccountTable
        accounts={accounts}
        onEdit={(acc: any) => {
          setSelectedAccount(acc);
          setShowModal(true);
        }}
        onDelete={async (id: string) => {
          await apiFetch(`/api/accounts?id=${id}`, {
            method: "DELETE",
          });
          fetchAccounts();
        }}
      />

      {/* Modal */}
      {showModal && (
        <AccountModal
          account={selectedAccount}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAccounts}
        />
      )}
    </div>
  );
}