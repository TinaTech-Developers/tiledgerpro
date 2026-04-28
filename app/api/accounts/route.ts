import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { organizationId: user.organizationId },
      include: { chartOfAccount: true },
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, chartOfAccountId } = await req.json();

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
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
