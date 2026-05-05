"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    notes: "",
    date: "",
    accountId: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));
  }, []);
  const [accounts, setAccounts] = useState<any[]>([]);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  useEffect(() => {
    if (!organizationId) return;

    const fetchAccounts = async () => {
      const data = await apiFetch(
        `/api/accounts?organizationId=${organizationId}`,
      );
      setAccounts(Array.isArray(data) ? data : []);
    };

    fetchAccounts();
  }, [organizationId]);

  const fetchExpenses = async () => {
    const data = await apiFetch(
      `/api/expenses?organizationId=${organizationId}`,
    );
    setExpenses(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const createExpense = async () => {
    if (!form.amount || !form.category || !form.accountId) {
      alert("Fill all required fields");
      return;
    }

    await apiFetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        organizationId,
        accountId: form.accountId,
        amount: Number(form.amount),
        category: form.category,
        notes: form.notes,
        date: form.date,
        createdById: "CURRENT_USER_ID", // replace with auth later
      }),
    });

    setOpen(false);
    setForm({
      amount: "",
      category: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
      accountId: "",
    });

    fetchExpenses();
  };

  // ================= STATS =================
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const count = expenses.length;

    const today = new Date().toDateString();

    const todayTotal = expenses
      .filter((e) => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return { total, count, todayTotal };
  }, [expenses]);
  // ================= FILTER =================
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.category?.toLowerCase().includes(search.toLowerCase()) ||
        e.notes?.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "ALL" || e.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));
  }, [expenses]);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">
            Track and manage business expenses
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Expense
        </button>
      </div>

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI title="Total Expenses" value={`$${stats.total.toFixed(2)}`} />
        <KPI title="Entries" value={stats.count} />
        <KPI title="Today" value={`$${stats.todayTotal.toFixed(2)}`} />
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Search by category or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs border ${
              categoryFilter === "ALL" ? "bg-black text-white" : "bg-white"
            }`}
          >
            All
          </button>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-full text-xs border ${
                categoryFilter === c ? "bg-black text-white" : "bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="grid sm:hidden gap-3">
        {filtered.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-xl shadow space-y-2">
            <div className="flex justify-between">
              <p className="font-semibold text-gray-800">{e.category}</p>
              <p className="font-bold text-red-600">
                -${Number(e.amount).toFixed(2)}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              {e.notes || "No description"}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(e.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="hidden sm:block bg-white border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Notes</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{e.category}</td>

                <td className="p-4 text-gray-500">{e.notes || "—"}</td>

                <td className="p-4 text-gray-500">
                  {new Date(e.date).toLocaleDateString()}
                </td>

                <td className="p-4 text-right font-semibold text-red-600">
                  -${Number(e.amount).toFixed(2)}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* AMOUNT */}
            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-2 rounded"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            {/* CATEGORY */}
            <input
              placeholder="Category (e.g Rent, Fuel, Salary)"
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            {/* ACCOUNT */}
            <select
              className="w-full border p-2 rounded"
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">
                {accounts.length === 0 ?
                  "Loading accounts..."
                : "Select Account"}
              </option>
              {accounts.length === 0 ?
                <option value="">No accounts available</option>
              : accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))
              }
            </select>

            {/* DATE */}
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            {/* NOTES */}
            <textarea
              placeholder="Notes (optional)"
              className="w-full border p-2 rounded"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={createExpense}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= KPI ================= */
function KPI({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
