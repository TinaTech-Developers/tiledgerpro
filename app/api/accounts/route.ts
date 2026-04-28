import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware";

export const runtime = "nodejs";

interface AuthenticatedRequest extends NextRequest {
  user: { organizationId: string };
}

// =========================
// GET ACCOUNTS
// =========================
export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  const user = (auth as AuthenticatedRequest).user;

  try {
    const accounts = await prisma.account.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        chartOfAccount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("GET accounts error:", err);

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
  const auth = await authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  const user = (auth as AuthenticatedRequest).user;

  try {
    const body = await req.json();
    const { name, type, chartOfAccountId } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type required" },
        { status: 400 },
      );
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: 0,
        organizationId: user.organizationId,
        chartOfAccountId: chartOfAccountId ?? null,
      },
      include: {
        chartOfAccount: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error("POST account error:", err);

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
