import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

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
// GET ASSETS
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 },
      );
    }

    const assets = await prisma.asset.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assets);
  } catch (err) {
    console.error("GET ASSETS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

// =========================
// CREATE ASSET
// =========================
export async function POST(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      category,
      purchaseCost,
      purchaseDate,
      usefulLife,
      assetAccountId, // 👈 NEW
      cashAccountId, // 👈 NEW
      notes,
    } = body;

    if (!name || !purchaseCost || !assetAccountId || !cashAccountId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const cost = Number(purchaseCost);
    const life = Number(usefulLife || 0);
    const txDate = purchaseDate ? new Date(purchaseDate) : new Date();

    // =========================
    // 1. CREATE ASSET
    // =========================
    const asset = await prisma.asset.create({
      data: {
        organizationId: user.organizationId,
        name,
        category,
        purchaseCost: cost,
        purchaseDate: txDate,
        usefulLife: life || null,
        currentValue: cost,
        notes,
      },
    });

    // =========================
    // 2. CREATE TRANSACTION
    // =========================
    const transaction = await prisma.transaction.create({
      data: {
        organizationId: user.organizationId,
        accountId: assetAccountId,
        amount: cost,
        type: "DEBIT",
        category: "ASSET_PURCHASE",
        notes: `Asset purchase: ${name}`,
        createdById: user.userId,
        referenceType: "asset",
        referenceId: asset.id,
      },
    });

    // =========================
    // 3. DEBIT ASSET ACCOUNT
    // =========================
    await prisma.generalLedgerEntry.create({
      data: {
        organizationId: user.organizationId,
        accountId: assetAccountId,
        transactionId: transaction.id,
        date: txDate,
        description: `Asset purchase: ${name}`,
        debit: cost,
        credit: 0,
        referenceType: "asset",
        referenceId: asset.id,
        balanceAfter: 0,
      },
    });

    // =========================
    // 4. CREDIT CASH/BANK
    // =========================
    await prisma.generalLedgerEntry.create({
      data: {
        organizationId: user.organizationId,
        accountId: cashAccountId,
        transactionId: transaction.id,
        date: txDate,
        description: `Paid for asset: ${name}`,
        debit: 0,
        credit: cost,
        referenceType: "asset",
        referenceId: asset.id,
        balanceAfter: 0,
      },
    });

    // =========================
    // 5. UPDATE BALANCES
    // =========================
    await prisma.account.update({
      where: { id: assetAccountId },
      data: { balance: { increment: cost } },
    });

    await prisma.account.update({
      where: { id: cashAccountId },
      data: { balance: { decrement: cost } },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    console.error("POST ASSET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
