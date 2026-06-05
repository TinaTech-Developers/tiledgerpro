export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// =========================
// 📥 GET QUOTATIONS
// =========================
export async function GET(req: NextRequest) {
  try {
    const organizationId = req.nextUrl.searchParams.get("organizationId");

    const id = req.nextUrl.searchParams.get("id");

    // ✅ VALIDATION
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );
    }

    // =========================
    // 🔎 GET SINGLE QUOTATION
    // =========================
    if (id) {
      const quotation = await prisma.quotation.findFirst({
        where: {
          id,
          organizationId,
        },

        include: {
          customer: true,

          organization: true,

          quotationItems: {
            include: {
              product: true,
            },
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
        organizationId,
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
    const body = await req.json();

    const { customerId, organizationId, items } = body;

    // ✅ VALIDATION
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items required" }, { status: 400 });
    }

    // =========================
    // 💰 CALCULATE TOTAL
    // =========================
    const totalAmount = items.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      return sum + qty * price;
    }, 0);

    // =========================
    // 🧾 CREATE QUOTATION
    // =========================
    const quotation = await prisma.quotation.create({
      data: {
        customerId,

        organizationId,

        totalAmount,

        status: "PENDING",

        quotationItems: {
          create: items.map((item: any) => ({
            productId: item.productId || null,

            description: item.description || "",

            quantity: Number(item.quantity || 0),

            price: Number(item.price || 0),
          })),
        },
      },

      include: {
        customer: true,

        organization: true,

        quotationItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (err: any) {
    console.error("POST QUOTATION ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Failed to create quotation",
      },
      { status: 500 },
    );
  }
}

// =========================
// ✏️ UPDATE QUOTATION
// =========================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Quotation ID required" },
        { status: 400 },
      );
    }

    const quotation = await prisma.quotation.update({
      where: { id },

      data: {
        ...(status && { status }),
      },
    });

    return NextResponse.json(quotation);
  } catch (err) {
    console.error("PATCH QUOTATION ERROR:", err);

    return NextResponse.json(
      { error: "Failed to update quotation" },
      { status: 500 },
    );
  }
}

// =========================
// ❌ DELETE QUOTATION
// =========================
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Quotation ID required" },
        { status: 400 },
      );
    }

    // delete items first
    await prisma.quotationItem.deleteMany({
      where: {
        quotationId: id,
      },
    });

    // delete quotation
    await prisma.quotation.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("DELETE QUOTATION ERROR:", err);

    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 },
    );
  }
}
