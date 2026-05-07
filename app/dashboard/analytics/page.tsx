"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const [txns, billsRes] = await Promise.all([
        apiFetch(`/api/transactions?organizationId=${organizationId}`),
        apiFetch(`/api/bills?organizationId=${organizationId}`),
      ]);

      setTransactions(txns?.data || txns || []);
      setBills(billsRes?.data || billsRes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= METRICS =================
  const income = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const profit = income - expense;

  const unpaidBills = bills
    .filter((b) => b.status !== "PAID")
    .reduce((a, b) => a + (b.totalAmount || 0), 0);

  const expenseRatio = income === 0 ? 0 : ((expense / income) * 100).toFixed(1);

  // ================= TREND DATA =================
  const trendData = useMemo(() => {
    const map: Record<string, any> = {};

    transactions.forEach((t) => {
      const d = new Date(t.createdAt).toLocaleDateString();

      if (!map[d]) {
        map[d] = { date: d, income: 0, expense: 0 };
      }

      if (t.type === "CREDIT") map[d].income += t.amount || 0;
      if (t.type === "DEBIT") map[d].expense += t.amount || 0;
    });

    return Object.values(map);
  }, [transactions]);

  // ================= INSIGHTS =================
  const insights = [
    {
      title: "Profit Health",
      value:
        profit > 0 ? "Business is profitable" : "Business is operating at loss",
      color: profit > 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Expense Ratio",
      value: `${expenseRatio}% of income`,
      color: Number(expenseRatio) < 60 ? "text-green-600" : "text-yellow-600",
    },
    {
      title: "Cash Exposure",
      value: `$${unpaidBills.toLocaleString()} unpaid bills`,
      color: "text-red-500",
    },
  ];

  // ================= ANIMATION =================
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Business intelligence & performance insights
        </p>
      </motion.div>

      {/* KPI CARDS */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item} className="card">
          <p className="text-sm text-gray-500">Revenue</p>
          <h2 className="text-xl font-bold text-green-600">
            ${income.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div variants={item} className="card">
          <p className="text-sm text-gray-500">Expenses</p>
          <h2 className="text-xl font-bold text-red-500">
            ${expense.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div variants={item} className="card">
          <p className="text-sm text-gray-500">Profit</p>
          <h2
            className={`text-xl font-bold ${
              profit >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            ${profit.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div variants={item} className="card">
          <p className="text-sm text-gray-500">Unpaid Bills</p>
          <h2 className="text-xl font-bold text-gray-800">
            ${unpaidBills.toLocaleString()}
          </h2>
        </motion.div>
      </motion.div>

      {/* INSIGHTS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-xl shadow"
          >
            <p className="text-sm text-gray-500">{ins.title}</p>
            <p className={`font-semibold ${ins.color}`}>{ins.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* TREND CHART */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-4 rounded-xl shadow"
      >
        <h2 className="font-semibold mb-3 text-gray-800">Revenue Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#16a34a" />
            <Line type="monotone" dataKey="expense" stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* SUMMARY INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 md:p-6 rounded-xl shadow"
      >
        <h2 className="font-semibold mb-2 text-gray-800">AI Insight</h2>

        {loading ?
          <p className="text-gray-500">Analyzing data...</p>
        : <p className="text-sm text-gray-600">
            Your business is generating{" "}
            <b className="text-green-600">${income.toLocaleString()}</b> in
            revenue with a{" "}
            <b className={profit >= 0 ? "text-green-600" : "text-red-500"}>
              ${profit.toLocaleString()}
            </b>{" "}
            net result. Expense ratio is <b>{expenseRatio}%</b>, indicating{" "}
            {Number(expenseRatio) < 60 ?
              "healthy cost control"
            : "rising operational costs"}
            .
          </p>
        }
      </motion.div>
    </div>
  );
}
