import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./../../../lib/prisma";
import { verifyToken } from "@/lib/jwt";

// =========================
// 🔐 AUTH HELPER
// =========================
function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) return null;

  return decoded; // AuthUser
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
    // 🔎 GET ONE QUOTATION
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
    // 📋 GET ALL QUOTATIONS
    // =========================
    const quotations = await prisma.quotation.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quotations);
  } catch (err) {
    console.error("GET QUOTATIONS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}

// =========================
// ➕ CREATE QUOTATION
// =========================
export async function POST(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, items } = body;

    // ✅ validation
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // =========================
    // 💰 CALCULATE TOTAL
    // =========================
    const total = items.reduce(
      (sum: number, i: any) =>
        sum + Number(i.quantity || 0) * Number(i.price || 0),
      0,
    );

    // =========================
    // 🧾 CREATE QUOTATION
    // =========================
    const quotation = await prisma.quotation.create({
      data: {
        customerId,
        organizationId: user.organizationId,
        totalAmount: total,
        status: "PENDING",

        quotationItems: {
          create: items.map((i: any) => ({
            // ✅ SUPPORT SERVICES (no productId required)
            productId: i.productId || null,
            description: i.description || null,
            quantity: Number(i.quantity || 0),
            price: Number(i.price || 0),
          })),
        },
      },
      include: {
        customer: true,
        organization: true,
        quotationItems: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (err) {
    console.error("POST QUOTATION ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 },
    );
  }
}
