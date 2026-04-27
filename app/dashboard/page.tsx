"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import Chart from "./components/Chart";
import RecentActivity from "./components/RecentActivity";
import Notifications from "./components/Notifications";
import { div } from "framer-motion/m";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Invoice {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  dueDate?: string;
}

interface Bill {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  dueDate?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  notes: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accRes, invRes, billRes, txnRes] = await Promise.all([
          fetch("/api/accounts").then((res) => res.json()),
          fetch("/api/invoices").then((res) => res.json()),
          fetch("/api/bills").then((res) => res.json()),
          fetch("/api/transactions").then((res) => res.json()),
        ]);

        const safeArray = (data: any) => (Array.isArray(data) ? data : []);

        setAccounts(safeArray(accRes));
        setInvoices(safeArray(invRes));
        setBills(safeArray(billRes));
        setTransactions(safeArray(txnRes));
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    }

    fetchData();
  }, []);

  // =====================
  // 📊 ANALYTICS
  // =====================

  const income = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = income - expenses;

  const outstandingInvoices = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const outstandingBills = bills
    .filter((b) => b.status !== "PAID")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // 🚨 OVERDUE LOGIC
  const today = new Date();

  const overdueInvoices = invoices.filter(
    (i) =>
      i.status !== "PAID" && i.createdAt && new Date(i.createdAt) < new Date(),
  );

  const alerts = overdueInvoices.map((i) => ({
    id: i.id,
    message: `Invoice overdue: $${i.totalAmount}`,
  }));

  const overdueBills = bills.filter(
    (b) => b.status !== "PAID" && b.dueDate && new Date(b.dueDate) < today,
  );

  // =====================
  // 📈 MONTHLY CHART DATA
  // =====================

  const monthlyData: Record<string, number> = {};

  transactions.forEach((t) => {
    const month = new Date(t.createdAt).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyData[month]) monthlyData[month] = 0;
    monthlyData[month] += t.amount;
  });

  const chartLabels = Object.keys(monthlyData);
  const chartValues = Object.values(monthlyData);

  // =====================
  // 📦 KPI TOTALS
  // =====================

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // =====================
  // 🔔 NOTIFICATIONS
  // =====================

  const notifications = [
    ...overdueInvoices.map((i) => ({
      id: i.id,
      message: `Overdue Invoice: $${i.totalAmount}`,
      type: "invoice",
    })),
    ...overdueBills.map((b) => ({
      id: b.id,
      message: `Overdue Bill: $${b.totalAmount}`,
      type: "bill",
    })),
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Balance" value={`$${totalBalance}`} />
        <SummaryCard title="Income" value={`$${income}`} />
        <SummaryCard title="Expenses" value={`$${expenses}`} />
        <SummaryCard title="Net Cashflow" value={`$${netCashFlow}`} />
      </div>

      {/* AR / AP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard
          title="Outstanding Invoices (AR)"
          value={`$${outstandingInvoices}`}
        />
        <SummaryCard
          title="Outstanding Bills (AP)"
          value={`$${outstandingBills}`}
        />
      </div>

      {/* Alerts */}
      {(overdueInvoices.length > 0 || overdueBills.length > 0) && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-xl">
          <h2 className="font-bold text-red-700 mb-2">⚠ Alerts</h2>
          {overdueInvoices.map((i) => (
            <p className="text-gray-900" key={i.id}>
              Invoice overdue: ${i.totalAmount}
            </p>
          ))}
          {overdueBills.map((b) => (
            <p className="text-gray-900" key={b.id}>
              Bill overdue: ${b.totalAmount}
            </p>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          labels={chartLabels}
          data={chartValues}
          title="Monthly Transactions"
        />

        <Chart
          labels={["Income", "Expenses"]}
          data={[income, expenses]}
          title="Income vs Expenses"
        />
      </div>

      {/* Notifications Panel */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">🔔 Notifications</h2>
        {notifications.length === 0 ?
          <p className="text-gray-500">No alerts</p>
        : notifications.map((n) => (
            <div key={n.id} className="border-b py-2 text-sm">
              {n.message}
            </div>
          ))
        }
      </div>

      {/* Recent Activity */}
      <RecentActivity
        activities={[
          ...transactions.map((t) => ({
            id: t.id,
            type: t.type,
            description: t.notes,
            amount: t.amount,
            date: t.createdAt,
          })),
        ]}
      />
    </div>
  );
}
