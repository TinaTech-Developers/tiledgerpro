export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const category = url.searchParams.get("category");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 },
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,

        ...(category && category !== "ALL" ? { category } : {}),

        ...(from || to ?
          {
            date: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          }
        : {}),
      },
      include: {
        account: true,
        createdBy: true,
        organization: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("EXPENSES GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}
