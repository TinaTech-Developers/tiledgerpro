"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  // FETCH
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

  // FILTER
  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.createdAt);
      if (from && d < new Date(from)) return false;
      if (to && d > new Date(to)) return false;
      return true;
    });
  }, [transactions, from, to]);

  // METRICS
  const income = filteredTxns
    .filter((t) => t.type === "CREDIT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const expense = filteredTxns
    .filter((t) => t.type === "DEBIT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const profit = income - expense;

  const chartData = useMemo(() => {
    const map: Record<string, any> = {};

    filteredTxns.forEach((t) => {
      const d = new Date(t.createdAt).toLocaleDateString();

      if (!map[d]) map[d] = { date: d, income: 0, expense: 0 };

      if (t.type === "CREDIT") map[d].income += t.amount || 0;
      if (t.type === "DEBIT") map[d].expense += t.amount || 0;
    });

    return Object.values(map);
  }, [filteredTxns]);

  // ================= ANIMATION VARIANTS =================
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
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
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-3"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Financial Reports
          </h1>
          <p className="text-sm text-gray-500">
            Real-time business performance overview
          </p>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="date"
            className="border p-2 rounded text-sm border-gray-300 focus:border-gray-500 focus:ring-0 text-gray-800"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded text-sm border-gray-300 focus:border-gray-500 focus:ring-0 text-gray-800"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </motion.div>

      {/* KPI CARDS */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={item} className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Income</p>
          <h2 className="text-xl font-bold text-green-600">
            ${income.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div variants={item} className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Expenses</p>
          <h2 className="text-xl font-bold text-red-500">
            ${expense.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div variants={item} className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Profit</p>
          <h2
            className={`text-xl font-bold ${
              profit >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            ${profit.toLocaleString()}
          </h2>
        </motion.div>
      </motion.div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BAR CHART */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-4 rounded-xl shadow"
        >
          <h2 className="font-semibold mb-3 text-gray-800">
            Income vs Expense
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#16a34a" />
              <Bar dataKey="expense" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* LINE CHART */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-4 rounded-xl shadow"
        >
          <h2 className="font-semibold mb-3 text-gray-800">Trend</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#16a34a" />
              <Line type="monotone" dataKey="expense" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* SUMMARY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 md:p-6 rounded-xl shadow"
      >
        <h2 className="font-semibold mb-2 text-gray-800">Insight</h2>

        {loading ?
          <p className="text-gray-500">Loading...</p>
        : <p className="text-sm text-gray-600">
            Your business generated <b className="text-green-600">${income}</b>{" "}
            income and spent <b className="text-red-500">${expense}</b>,
            resulting in{" "}
            <b className={profit >= 0 ? "text-green-600" : "text-red-500"}>
              ${profit}
            </b>{" "}
            net profit.
          </p>
        }
      </motion.div>
    </div>
  );
}
