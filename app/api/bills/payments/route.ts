export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =========================
// GET payments by bill
// =========================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const billId = searchParams.get("billId");

    if (!billId) {
      return NextResponse.json(
        { error: "billId query parameter is required" },
        { status: 400 },
      );
    }

    const payments = await prisma.payment.findMany({
      where: { billId },
      include: {
        createdBy: true,
        organization: true,
        bill: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(payments);
  } catch (err) {
    console.error("GET PAYMENTS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

// =========================
// POST payment
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, amount, date, organizationId, createdById, accountId } =
      body;

    if (!billId || !amount || !organizationId || !createdById || !accountId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Create payment
    const payment = await prisma.payment.create({
      data: {
        billId,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        organizationId,
        createdById,
      },
    });

    // 2. Recalculate bill using UPDATED payments
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { payments: true },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const totalPaid = bill.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

    if (totalPaid >= bill.totalAmount) status = "PAID";
    else if (totalPaid > 0) status = "PARTIAL";

    await prisma.bill.update({
      where: { id: billId },
      data: { status },
    });

    // 3. Ledger entry (cash OUT)
    await prisma.generalLedgerEntry.create({
      data: {
        accountId,
        transactionId: payment.id,
        organizationId,
        date: payment.date,
        description: `Bill payment #${bill.id}`,
        debit: 0,
        credit: Number(amount),
        balanceAfter: 0,
      },
    });

    return NextResponse.json({
      payment,
      billStatus: status,
      totalPaid,
    });
  } catch (err) {
    console.error("POST PAYMENT ERROR:", err);

    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 },
    );
  }
}
