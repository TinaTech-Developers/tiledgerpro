export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const category = url.searchParams.get("category");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 },
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,

        ...(category && category !== "ALL" ? { category } : {}),

        ...(from || to ?
          {
            date: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          }
        : {}),
      },
      include: {
        account: true,
        createdBy: true,
        organization: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("EXPENSES GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}

// =========================
// CREATE EXPENSE
// =========================

// =========================
// AUTH HELPER
// =========================
function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") return null;

  return decoded as {
    userId: string;
    organizationId: string;
  };
}

// =========================
// CREATE EXPENSE
// =========================
export async function POST(req: NextRequest) {
  const body = await req.json();

  const user = getUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId, cashAccountId, amount, category, notes, date } = body;

  if (!accountId || !cashAccountId || !amount) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const txDate = new Date(date);

    // 1. EXPENSE
    const expense = await prisma.expense.create({
      data: {
        organizationId: user.organizationId,
        accountId,
        amount,
        category,
        notes,
        date: txDate,
        createdById: user.userId,
        status: "POSTED",
      },
    });

    // 2. TRANSACTION
    const transaction = await prisma.transaction.create({
      data: {
        organizationId: user.organizationId,
        accountId,
        amount,
        type: "DEBIT",
        category,
        notes,
        createdById: user.userId,
        referenceType: "expense",
        referenceId: expense.id,
      },
    });

    // 3. DEBIT (expense account)
    await prisma.generalLedgerEntry.create({
      data: {
        organizationId: user.organizationId,
        accountId,
        transactionId: transaction.id,
        date: txDate,
        description: `Expense: ${category}`,
        debit: amount,
        credit: 0,
        referenceType: "expense",
        referenceId: expense.id,
        balanceAfter: 0,
      },
    });

    // 4. CREDIT (cash account)
    await prisma.generalLedgerEntry.create({
      data: {
        organizationId: user.organizationId,
        accountId: cashAccountId,
        transactionId: transaction.id,
        date: txDate,
        description: `Paid expense: ${category}`,
        debit: 0,
        credit: amount,
        referenceType: "expense",
        referenceId: expense.id,
        balanceAfter: 0,
      },
    });

    // 5. UPDATE BALANCES
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    });

    await prisma.account.update({
      where: { id: cashAccountId },
      data: { balance: { decrement: amount } },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}
