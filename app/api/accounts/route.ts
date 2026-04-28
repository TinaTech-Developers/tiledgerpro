import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

// =========================
// AUTH HELPER (INLINE SAFE)
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
// GET ACCOUNTS
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { organizationId: user.organizationId },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("GET ACCOUNTS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

// =========================
// CREATE ACCOUNT
// =========================
export async function POST(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, chartOfAccountId } = body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: 0,
        organizationId: user.organizationId,
        chartOfAccountId: chartOfAccountId ?? null,
      },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error("POST ACCOUNT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}

// =========================
// UPDATE ACCOUNT
// =========================
export async function PUT(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, type, chartOfAccountId } = body;

    const existing = await prisma.account.findUnique({ where: { id } });

    if (!existing || existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        type,
        chartOfAccountId: chartOfAccountId ?? null,
      },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(account);
  } catch (err) {
    console.error("PUT ACCOUNT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

// =========================
// DELETE ACCOUNT
// =========================
export async function DELETE(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.account.findUnique({ where: { id } });

    if (!existing || existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
