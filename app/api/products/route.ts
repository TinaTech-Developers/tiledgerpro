export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// =========================
// GET PRODUCTS
// =========================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );
    }

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// =========================
// CREATE PRODUCT
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, description, price, stock, organizationId } = body;

    // ✅ validation
    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "name and organizationId required" },
        { status: 400 },
      );
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      return NextResponse.json(
        { error: "Invalid price or stock" },
        { status: 400 },
      );
    }

    // ✅ ensure org exists
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Invalid organizationId" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        price: parsedPrice,
        stock: parsedStock,
        organizationId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("CREATE PRODUCT ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 },
    );
  }
}
