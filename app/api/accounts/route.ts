export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
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
