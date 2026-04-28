export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { authMiddleware } from "@/lib/middleware";

type Entry = {
  accountId: string;
  debit?: number;
  credit?: number;
};

// -------------------------
// POST: Create Transaction
// -------------------------
export async function POST(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request;

  const user = (request as any).user;

  try {
    const body = await request.json();
    const { description, entries } = body;

    if (!entries || entries.length < 2) {
      return NextResponse.json(
        { error: "At least two entries required" },
        { status: 400 },
      );
    }

    const totalDebit = entries.reduce(
      (sum: number, e: Entry) => sum + (e.debit || 0),
      0,
    );

    const totalCredit = entries.reduce(
      (sum: number, e: Entry) => sum + (e.credit || 0),
      0,
    );

    if (totalDebit !== totalCredit) {
      return NextResponse.json(
        { error: "Debits must equal credits" },
        { status: 400 },
      );
    }

    // validate accounts
    for (const entry of entries) {
      const account = await prisma.account.findUnique({
        where: { id: entry.accountId },
      });

      if (!account || account.organizationId !== user.organizationId) {
        return NextResponse.json(
          { error: `Invalid account: ${entry.accountId}` },
          { status: 400 },
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: totalDebit,
        type: "DEBIT",
        notes: description || "",

        account: {
          connect: { id: entries[0].accountId },
        },

        organization: {
          connect: { id: user.organizationId },
        },

        createdBy: {
          connect: { id: user.userId },
        },

        ledgerEntries: {
          create: entries.map((entry: Entry) => ({
            account: { connect: { id: entry.accountId } },
            organization: { connect: { id: user.organizationId } },
            debit: entry.debit || 0,
            credit: entry.credit || 0,
            balanceAfter: 0,
            date: new Date(),
            description: description || "",
          })),
        },
      },
      include: { ledgerEntries: true },
    });

    // update balances
    for (const entry of transaction.ledgerEntries) {
      const account = await prisma.account.findUnique({
        where: { id: entry.accountId },
      });

      if (!account) continue;

      const newBalance =
        account.balance + (entry.debit || 0) - (entry.credit || 0);

      await prisma.account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      await prisma.generalLedgerEntry.update({
        where: { id: entry.id },
        data: { balanceAfter: newBalance },
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}

// -------------------------
// GET transactions
// -------------------------
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        account: true,
        organization: true,
        createdBy: true,
        ledgerEntries: {
          include: { account: true },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
