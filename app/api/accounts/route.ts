import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

// =========================
// AUTH (SAFE + PURE)
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
      where: {
        organizationId: user.organizationId,
      },
      include: {
        chartOfAccount: true,
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
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, chartOfAccountId } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: 0,
        organizationId: user.organizationId,
        chartOfAccountId: chartOfAccountId ?? null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error("POST accounts error:", err);

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
