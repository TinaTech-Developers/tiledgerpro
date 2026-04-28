export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { authMiddleware } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request;

  const user = (request as any).user;

  try {
    const { transactionId } = await request.json();

    // 1️⃣ Get original transaction + ledger
    const original = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ledgerEntries: true,
      },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // 2️⃣ Prevent double reversal
    const alreadyReversed = await prisma.transaction.findFirst({
      where: {
        reversedFrom: {
          id: transactionId,
        },
      },
    });

    if (alreadyReversed) {
      return NextResponse.json(
        { error: "Transaction already reversed" },
        { status: 400 },
      );
    }

    // 3️⃣ Create reversed transaction
    const reversedTransaction = await prisma.transaction.create({
      data: {
        // ✅ REQUIRED FIELD (THIS FIXES YOUR ERROR)
        account: {
          connect: { id: original.accountId },
        },

        amount: original.amount,
        type: original.type === "DEBIT" ? "CREDIT" : "DEBIT",
        notes: `Reversal of: ${original.notes || ""}`,

        organization: {
          connect: { id: user.organizationId },
        },
        createdBy: {
          connect: { id: user.userId },
        },

        // ✅ RELATION (correct way)
        reversedFrom: {
          connect: { id: transactionId },
        },

        // ✅ Create reversed ledger entries
        ledgerEntries: {
          create: original.ledgerEntries.map((e) => ({
            account: {
              connect: { id: e.accountId },
            },
            organization: {
              connect: { id: user.organizationId },
            },
            debit: e.credit,
            credit: e.debit,
            description: `Reversal: ${original.notes || ""}`,
            date: new Date(),
            balanceAfter: 0, // (you can improve this later)
          })),
        },
      },
    });

    return NextResponse.json(reversedTransaction, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to reverse transaction" },
      { status: 500 },
    );
  }
}
