import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./../../../../lib/prisma";

/* ================= GET ONE EXPENSE ================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        account: true,
        organization: true,
        createdBy: true,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("GET EXPENSE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 },
    );
  }
}

/* ================= UPDATE EXPENSE ================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await req.json();

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        category: body.category,
        notes: body.notes,
        date: body.date ? new Date(body.date) : undefined,
        accountId: body.accountId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 },
    );
  }
}

/* ================= DELETE EXPENSE ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
