import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =========================
// GET account by ID
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: { chartOfAccount: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (err) {
    console.error("GET account error:", err);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 },
    );
  }
}

// =========================
// DELETE account
// =========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.account.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE account error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}

// =========================
// PATCH update account
// =========================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { name, type, chartOfAccountId } = body;

    const data: any = {};

    if (name) data.name = name;
    if (type) data.type = type;

    if (chartOfAccountId) {
      data.chartOfAccount = {
        connect: { id: chartOfAccountId },
      };
    }

    const account = await prisma.account.update({
      where: { id: params.id },
      data,
      include: { chartOfAccount: true },
    });

    return NextResponse.json(account);
  } catch (err) {
    console.error("PATCH account error:", err);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}
