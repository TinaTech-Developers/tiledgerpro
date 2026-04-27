export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// =========================
// GET → Fetch bills
// =========================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const vendorId = searchParams.get("vendorId");
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");

    const bills = await prisma.bill.findMany({
      where: {
        // ✅ ONLY include filters if they exist
        ...(vendorId ? { vendorId } : {}),
        ...(organizationId ? { organizationId } : {}),
        ...(status ?
          {
            status: status as "DRAFT" | "UNPAID" | "PARTIAL" | "PAID",
          }
        : {}),
      },
      include: {
        vendor: true,
        organization: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bills);
  } catch (err) {
    console.error("GET /api/bills error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 },
    );
  }
}

// =========================
// POST → Create a new bill
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      vendorId,
      organizationId,
      totalAmount,
      dueDate,
      createdById,
      description,
    } = body;

    // =========================
    // 1️⃣ VALIDATION
    // =========================
    if (!vendorId || !organizationId || !totalAmount || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const amount = Number(totalAmount);

    // =========================
    // 2️⃣ GET OR CREATE AP ACCOUNT (AUTO FIX)
    // =========================
    let apAccount = await prisma.account.findFirst({
      where: {
        organizationId,
        type: "ACCOUNTS_PAYABLE",
      },
    });

    if (!apAccount) {
      apAccount = await prisma.account.create({
        data: {
          name: "Accounts Payable",
          type: "ACCOUNTS_PAYABLE",
          organizationId,
          balance: 0,
        },
      });
    }

    // =========================
    // 3️⃣ CREATE BILL
    // =========================
    const bill = await prisma.bill.create({
      data: {
        vendorId,
        organizationId,
        totalAmount: amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "UNPAID",
      },
    });

    // =========================
    // 4️⃣ UPDATE AP ACCOUNT BALANCE
    // =========================
    const newBalance = apAccount.balance + amount;

    await prisma.account.update({
      where: { id: apAccount.id },
      data: { balance: newBalance },
    });

    // =========================
    // 5️⃣ CREATE LEDGER ENTRY
    // =========================
    await prisma.generalLedgerEntry.create({
      data: {
        accountId: apAccount.id,
        transactionId: bill.id,
        organizationId,
        date: new Date(),
        description: description || `Bill created (${bill.id})`,
        debit: 0,
        credit: amount,
        balanceAfter: newBalance,
      },
    });

    return NextResponse.json(
      {
        message: "Bill created successfully",
        bill,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("POST /api/bills error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create bill" },
      { status: 500 },
    );
  }
}
