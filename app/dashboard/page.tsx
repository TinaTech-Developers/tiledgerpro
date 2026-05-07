"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
      const [a, t] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/transactions"),
      ]);

      const ad = await a.json();
      const td = await t.json();

      setAnalytics(ad);
      setTransactions(Array.isArray(td) ? td : []);
    }

    load();
  }, []);

  if (!analytics) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const income = Number(analytics.income || 0);
  const expenses = Number(analytics.expenses || 0);
  const net = Number(analytics.net || 0);
  const expenseRatio = Number(analytics.expenseRatio || 0);

  const labels = Object.keys(analytics.monthly || {});
  const values = Object.values(analytics.monthly || {});

  const expenseLabels = Object.keys(analytics.categories || {});
  const expenseValues = Object.values(analytics.categories || {});

  const topCategory =
    expenseLabels.length > 0 ?
      expenseLabels[expenseValues.indexOf(Math.max(...expenseValues))]
    : "None";

  // animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen space-y-6">
      {/* ================= KPIs ================= */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {[
          { title: "Income", value: income },
          { title: "Expenses", value: expenses },
          { title: "Net Profit", value: net },
          { title: "Expense Ratio", value: `${expenseRatio.toFixed(1)}%` },
        ].map((c, i) => (
          <motion.div key={i} variants={item}>
            <SummaryCard title={c.title} value={`$${c.value}`} />
          </motion.div>
        ))}
      </motion.div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="xl:col-span-2 bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="font-semibold mb-3 text-gray-700">
            Monthly Transactions
          </h2>
          <Chart labels={labels} data={values} />
        </motion.div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Speedometer value={expenseRatio} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <h2 className="font-semibold mb-3 text-gray-700">
              Income vs Expenses
            </h2>
            <Chart
              labels={["Income", "Expenses"]}
              data={[income, expenses]}
              type="bar"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <h2 className="font-semibold mb-3 text-gray-700">
              Expense Categories
            </h2>
            <Chart labels={expenseLabels} data={expenseValues} type="bar" />
          </motion.div>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2"
        >
          <RecentActivity
            activities={transactions.map((t) => ({
              id: t.id,
              type: t.type,
              description: t.notes || t.category || "Transaction",
              amount: t.amount,
              date: t.createdAt,
            }))}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <SummaryCard
            title="Outstanding Invoices"
            value={`$${analytics.outstandingInvoices}`}
          />
          <SummaryCard
            title="Outstanding Bills"
            value={`$${analytics.outstandingBills}`}
          />
          <SummaryCard title="Top Category" value={topCategory} />
        </motion.div>
      </div>
    </div>
  );
}
