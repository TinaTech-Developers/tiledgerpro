import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// =========================
// 🔐 AUTH HELPER
// =========================
function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  return verifyToken(token);
}

// =========================
// 📥 GET (ALL OR ONE)
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // =========================
    // 🔎 SINGLE QUOTATION
    // =========================
    if (id) {
      const quotation = await prisma.quotation.findFirst({
        where: {
          id,
          organizationId: user.organizationId,
        },
        include: {
          customer: true,
          organization: true,
          quotationItems: {
            include: { product: true },
          },
        },
      });

      if (!quotation) {
        return NextResponse.json(
          { error: "Quotation not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(quotation);
    }

    // =========================
    // 📋 ALL QUOTATIONS
    // =========================
    const quotations = await prisma.quotation.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        customer: true,
        quotationItems: {
          include: { product: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("GET QUOTATIONS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
