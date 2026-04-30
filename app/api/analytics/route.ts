import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // =========================
    // FETCH DATA (SAFE)
    // =========================
    const [transactions, invoices, bills] = await Promise.all([
      prisma.transaction.findMany({
        include: { account: true },
      }),
      prisma.invoice.findMany(),
      prisma.bill.findMany(),
    ]);

    // =========================
    // METRICS
    // =========================
    let income = 0;
    let expenses = 0;

    for (const t of transactions) {
      if (t.type === "CREDIT") income += t.amount;
      if (t.type === "DEBIT") expenses += t.amount;
    }

    const net = income - expenses;

    // =========================
    // MONTHLY DATA
    // =========================
    const monthly: Record<string, number> = {};

    for (const t of transactions) {
      const month = new Date(t.createdAt).toLocaleString("default", {
        month: "short",
      });

      monthly[month] = (monthly[month] || 0) + t.amount;
    }

    // =========================
    // CATEGORIES
    // =========================
    const categories: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === "DEBIT") {
        const cat = t.category || "Other";
        categories[cat] = (categories[cat] || 0) + t.amount;
      }
    }

    // =========================
    // ACCOUNTS
    // =========================
    const accounts: Record<string, number> = {};

    for (const t of transactions) {
      const name = t.account?.name || "Unknown";
      accounts[name] = (accounts[name] || 0) + t.amount;
    }

    // =========================
    // OUTSTANDING
    // =========================
    const outstandingInvoices = invoices
      .filter((i) => i.status !== "PAID")
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const outstandingBills = bills
      .filter((b) => b.status !== "PAID")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // =========================
    // RATIO
    // =========================
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      income,
      expenses,
      net,
      expenseRatio: Number(expenseRatio.toFixed(2)),

      monthly,
      categories,
      accounts,

      outstandingInvoices,
      outstandingBills,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
