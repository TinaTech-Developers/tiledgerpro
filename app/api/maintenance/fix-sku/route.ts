import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      if (!product.sku) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            sku: `PROD-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        });
      }
    }

    return NextResponse.json({ message: "SKU fixed successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fix SKU" }, { status: 500 });
  }
}
