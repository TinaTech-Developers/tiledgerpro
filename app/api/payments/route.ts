export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const invoiceId = searchParams.get("invoiceId") || undefined;
    const billId = searchParams.get("billId") || undefined;
    const organizationId = searchParams.get("organizationId") || undefined;

    const payments = await prisma.payment.findMany({
      where: {
        invoiceId,
        billId,
        organizationId,
      },
      include: {
        invoice: true,
        bill: true,
        createdBy: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(payments);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      invoiceId,
      billId,
      organizationId,
      createdById,
      accountId,
      amount,
      date,
    } = body;

    // 1️⃣ VALIDATION (must be invoice OR bill)
    if (!organizationId || !createdById || !accountId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!invoiceId && !billId) {
      return NextResponse.json(
        { error: "Either invoiceId or billId is required" },
        { status: 400 },
      );
    }

    // 2️⃣ GET ACCOUNT
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // 3️⃣ CREATE PAYMENT
    const payment = await prisma.payment.create({
      data: {
        amount,
        date: date ? new Date(date) : new Date(),
        organizationId,
        createdById,
        invoiceId: invoiceId || null,
        billId: billId || null,
      },
    });

    let newBalance = account.balance;

    // =========================
    // 🟢 INVOICE PAYMENT (INCOME)
    // =========================
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 },
        );
      }

      const payments = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { invoiceId },
      });

      const totalPaid = payments._sum.amount || 0;

      let status: "SENT" | "PARTIAL" | "PAID" = "SENT";

      if (totalPaid >= invoice.totalAmount) {
        status = "PAID";
      } else if (totalPaid > 0) {
        status = "PARTIAL";
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });

      // 💰 MONEY IN (INCREASE ACCOUNT)
      newBalance = account.balance + amount;

      await prisma.generalLedgerEntry.create({
        data: {
          accountId,
          transactionId: payment.id,
          organizationId,
          date: payment.date,
          description: `Invoice payment (${invoiceId})`,
          debit: amount,
          credit: 0,
          balanceAfter: newBalance,
        },
      });
    }

    // =========================
    // 🔴 BILL PAYMENT (EXPENSE)
    // =========================
    if (billId) {
      const bill = await prisma.bill.findUnique({
        where: { id: billId },
      });

      if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }

      const payments = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { billId },
      });

      const totalPaid = payments._sum.amount || 0;

      let status: "DRAFT" | "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

      if (totalPaid >= bill.totalAmount) {
        status = "PAID";
      } else if (totalPaid > 0) {
        status = "PARTIAL";
      }

      await prisma.bill.update({
        where: { id: billId },
        data: { status },
      });

      // 💸 MONEY OUT (DECREASE ACCOUNT)
      newBalance = account.balance - amount;

      await prisma.generalLedgerEntry.create({
        data: {
          accountId,
          transactionId: payment.id,
          organizationId,
          date: payment.date,
          description: `Bill payment (${billId})`,
          debit: 0,
          credit: amount,
          balanceAfter: newBalance,
        },
      });
    }

    // 4️⃣ UPDATE ACCOUNT BALANCE
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        payment,
        newBalance,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to process payment" },
      { status: 500 },
    );
  }
}
