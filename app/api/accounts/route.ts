export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware";

// GET all accounts for the user's organization
export async function GET(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request; // auth failed

  const user = (request as any).user;

  try {
    const accounts = await prisma.account.findMany({
      where: { organizationId: user.organizationId },
      include: { chartOfAccount: true },
    });
    return NextResponse.json(accounts);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

// POST create account
export async function POST(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request;

  const user = (request as any).user;

  try {
    const body = await request.json();
    const { name, type, chartOfAccountId } = body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: 0,
        organizationId: user.organizationId, // ✅ direct field
        chartOfAccountId: chartOfAccountId || undefined,
      },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}

// PUT update account
export async function PUT(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request;

  const user = (request as any).user;

  try {
    const body = await request.json();
    const { id, name, type, chartOfAccountId } = body;

    // ensure the account belongs to this organization
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    });
    if (
      !existingAccount ||
      existingAccount.organizationId !== user.organizationId
    ) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        type,
        chartOfAccount:
          chartOfAccountId ? { connect: { id: chartOfAccountId } } : undefined,
      },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(account);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

// DELETE account
export async function DELETE(req: NextRequest) {
  const request = await authMiddleware(req);
  if (request instanceof NextResponse) return request;

  const user = (request as any).user;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // ensure the account belongs to this organization
    const existingAccount = await prisma.account.findUnique({ where: { id } });
    if (
      !existingAccount ||
      existingAccount.organizationId !== user.organizationId
    ) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
