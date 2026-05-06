// get an expense by id
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        createdBy: true,
        organization: true,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (err) {
    console.error("EXPENSE GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 },
    );
  }
}

