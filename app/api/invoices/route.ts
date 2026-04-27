export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { InvoiceStatus } from "@prisma/client"; // import enum

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");
    const statusParam = url.searchParams.get("status");

    // Convert string to InvoiceStatus enum if valid
    let status: InvoiceStatus | undefined = undefined;
    if (
      statusParam &&
      Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus)
    ) {
      status = statusParam as InvoiceStatus;
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(status && { status }),
      },
      include: {
        customer: true,
        payments: true,
        invoiceItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

// POST → Create a new invoice with items

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, organizationId, dueDate, items } = body;

    if (!customerId || !organizationId) {
      return NextResponse.json(
        { error: "customerId and organizationId required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items required" }, { status: 400 });
    }

    // ✅ calculate total safely
    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = Number(item.price);
      const qty = Number(item.quantity);

      if (isNaN(price) || isNaN(qty)) {
        throw new Error("Invalid item values");
      }

      return sum + price * qty;
    }, 0);

    const invoice = await prisma.invoice.create({
      data: {
        customerId,
        organizationId,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "DRAFT",

        invoiceItems: {
          create: items.map((item: any) => ({
            productId: item.productId || null, // ✅ optional
            description: item.description,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: {
        customer: true,
        invoiceItems: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    console.error("INVOICE CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create invoice" },
      { status: 500 },
    );
  }
}
