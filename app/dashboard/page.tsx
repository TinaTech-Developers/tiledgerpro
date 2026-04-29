"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import Chart from "./components/Chart";
import RecentActivity from "./components/RecentActivity";
import Speedometer from "./components/Speedometer";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [txn, acc] = await Promise.all([
          fetch("/api/transactions").then((r) => r.json()),
          fetch("/api/accounts").then((r) => r.json()),
        ]);

        setTransactions(Array.isArray(txn) ? txn : []);
        setAccounts(Array.isArray(acc) ? acc : []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // ================= DATA =================
  const income = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + t.amount, 0);

  const balance = accounts.reduce((s, a) => s + a.balance, 0);

  const net = income - expenses;

  // monthly chart
  const monthly: Record<string, number> = {};
  transactions.forEach((t) => {
    const m = new Date(t.createdAt).toLocaleString("default", {
      month: "short",
    });
    monthly[m] = (monthly[m] || 0) + t.amount;
  });

  const labels = Object.keys(monthly);
  const values = Object.values(monthly);

  // ================= UI =================
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen space-y-6">
      {/* ==== KPI ==== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Balance" value={`$${balance}`} />
        <SummaryCard title="Income" value={`$${income}`} />
        <SummaryCard title="Expenses" value={`$${expenses}`} />
        <SummaryCard title="Net" value={`$${net}`} />
      </div>

      {/* ==== MAIN ==== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* BIG CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
          <Chart labels={labels} data={values} />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">
          {/* Speedometer */}
          <Speedometer value={net} max={10000} />

          {/* Animated Bar Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <Chart
              labels={["Income", "Expenses"]}
              data={[income, expenses]}
              type="bar"
            />
          </div>

          {/* Notifications */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="font-semibold mb-2">Notifications</h2>
            <p className="text-gray-400 text-sm">No alerts</p>
          </div>
        </div>
      </div>

      {/* ==== BOTTOM ==== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentActivity
            activities={transactions.map((t) => ({
              id: t.id,
              type: t.type,
              description: t.notes || "Transaction",
              amount: t.amount,
              date: t.createdAt,
            }))}
          />
        </div>

        <div className="flex flex-col gap-6">
          <SummaryCard title="Outstanding Invoices" value="$0" />
          <SummaryCard title="Outstanding Bills" value="$0" />
        </div>
      </div>
    </div>
  );
}
