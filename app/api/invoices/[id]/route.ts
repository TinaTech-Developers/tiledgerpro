import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET invoice by ID
export async function GET(
  req: NextRequest,
 context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        invoiceItems: { include: { product: true } },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}

// PATCH update invoice by ID
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { status, totalAmount, dueDate, items } = body;

    // Validate status
    const validStatuses = [
      "DRAFT",
      "SENT",
      "PAID",
      "PARTIAL",
      "OVERDUE",
    ] as const;
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        // For invoice items, you could either replace or handle individually:
        invoiceItems:
          items ?
            {
              deleteMany: {}, // remove existing items
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            }
          : undefined,
      },
      include: {
        invoiceItems: { include: { product: true } },
        customer: true,
        payments: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

// DELETE invoice by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await prisma.invoice.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
