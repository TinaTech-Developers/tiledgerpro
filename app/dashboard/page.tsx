"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import Chart from "./components/Chart";
import RecentActivity from "./components/RecentActivity";
import Speedometer from "./components/Speedometer";

type Analytics = {
  income: number;
  expenses: number;
  net: number;
  expenseRatio: number;

  monthly: Record<string, number>;
  categories: Record<string, number>;

  outstandingInvoices: number;
  outstandingBills: number;
};

type Transaction = {
  id: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  notes?: string;
  category?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, txnRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/transactions"),
        ]);

        const analyticsData: Analytics = await analyticsRes.json();
        const txnData: Transaction[] = await txnRes.json();

        setAnalytics(analyticsData);
        setTransactions(Array.isArray(txnData) ? txnData : []);
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    }

    load();
  }, []);

  // ⛔ prevent render before data
  if (!analytics) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  // ================= SAFE DATA =================
  const income = Number(analytics.income || 0);
  const expenses = Number(analytics.expenses || 0);
  const net = Number(analytics.net || 0);
  const expenseRatio = Number(analytics.expenseRatio || 0);

  const outstandingInvoices = Number(analytics.outstandingInvoices || 0);
  const outstandingBills = Number(analytics.outstandingBills || 0);

  const labels = Object.keys(analytics.monthly || {});
  const values = Object.values(analytics.monthly || {});

  const expenseLabels = Object.keys(analytics.categories || {});
  const expenseValues = Object.values(analytics.categories || {});

  const topCategory =
    expenseLabels.length > 0 ?
      expenseLabels[expenseValues.indexOf(Math.max(...expenseValues))]
    : "None";

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Income" value={`$${income.toLocaleString()}`} />
        <SummaryCard title="Expenses" value={`$${expenses.toLocaleString()}`} />
        <SummaryCard title="Net Profit" value={`$${net.toLocaleString()}`} />
        <SummaryCard
          title="Expense Ratio"
          value={`${expenseRatio.toFixed(1)}%`}
        />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3 text-gray-700">
            Monthly Transactions
          </h2>
          <Chart labels={labels} data={values} />
        </div>

        <div className="flex flex-col gap-6">
          <Speedometer value={expenseRatio} />

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3 text-gray-700">
              Income vs Expenses
            </h2>
            <Chart
              labels={["Income", "Expenses"]}
              data={[income, expenses]}
              type="bar"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3 text-gray-700">
              Expense Categories
            </h2>
            <Chart labels={expenseLabels} data={expenseValues} type="bar" />
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentActivity
            activities={transactions.map((t) => ({
              id: t.id,
              type: t.type,
              description: t.notes || t.category || "Transaction",
              amount: t.amount,
              date: t.createdAt,
            }))}
          />
        </div>

        <div className="flex flex-col gap-6">
          <SummaryCard
            title="Outstanding Invoices"
            value={`$${outstandingInvoices.toLocaleString()}`}
          />
          <SummaryCard
            title="Outstanding Bills"
            value={`$${outstandingBills.toLocaleString()}`}
          />
          <SummaryCard title="Top Category" value={topCategory} />
        </div>
      </div>
    </div>
  );
}
