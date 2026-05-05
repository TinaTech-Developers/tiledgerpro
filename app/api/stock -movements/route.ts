export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./../../../lib/prisma";

// ================= GET: Fetch movements =================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const productId = url.searchParams.get("productId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );
    }

    const movements = await prisma.stockMovement.findMany({
      where: {
        organizationId,
        ...(productId && { productId }),
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(movements);
  } catch (err) {
    console.error("FETCH MOVEMENTS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 },
    );
  }
}

// ================= POST: Create movement =================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, organizationId, type, quantity, note } = body;

    if (!productId || !organizationId || !type || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 🔥 Handle stock logic
    let stockChange = 0;

    switch (type) {
      case "IN":
      case "RETURN":
        stockChange = quantity;
        break;

      case "OUT":
      case "SALE":
        stockChange = -quantity;
        break;

      case "ADJUSTMENT":
        stockChange = quantity; // manual override logic handled below
        break;

      default:
        return NextResponse.json(
          { error: "Invalid movement type" },
          { status: 400 },
        );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔍 get current product
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // 🔥 adjustment = set exact stock
      let newStock = product.stock;

      if (type === "ADJUSTMENT") {
        newStock = quantity;
      } else {
        newStock = product.stock + stockChange;
      }

      if (newStock < 0) {
        throw new Error("Insufficient stock");
      }

      // ✅ update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          status: newStock === 0 ? "OUT_OF_STOCK" : "IN_STOCK",
        },
      });

      // ✅ create movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          organizationId,
          type,
          quantity,
          note,
        },
      });

      return { movement, updatedProduct };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("CREATE MOVEMENT ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create movement" },
      { status: 500 },
    );
  }
}
