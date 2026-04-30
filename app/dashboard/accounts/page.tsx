"use client";

import { useEffect, useState } from "react";
import AccountTable from "./components/AccountTable";
import AccountModal from "./components/AccountModal";
import { apiFetch } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

export default function AccountsPage() {
  const [data, setData] = useState<any>({
    accounts: [],
    totalPages: 1,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 5;

  // =========================
  // FETCH ACCOUNTS
  // =========================
  const fetchAccounts = async () => {
    const res = await apiFetch(
      `/api/accounts?page=${page}&limit=${perPage}&search=${search}`,
    );

    setData(res);
  };

  // =========================
  // INITIAL LOAD + PAGE CHANGE
  // =========================
  useEffect(() => {
    fetchAccounts();
  }, [page]);

  // =========================
  // DEBOUNCED SEARCH
  // =========================
  useDebounce(search, 400, () => {
    setPage(1); // reset page when searching
    fetchAccounts();
  });

  const accounts = data.accounts || [];
  const totalPages = data.totalPages || 1;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700">
          Accounts
        </h1>

        <button
          onClick={() => {
            setSelectedAccount(null);
            setShowModal(true);
          }}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          + New Account
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search accounts..."
        className="w-full sm:max-w-sm border rounded-lg text-gray-600 border-gray-300 px-3 py-2 text-sm"
      />

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

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-gray-500">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

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
