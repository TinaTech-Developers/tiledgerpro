// /app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET a single customer by ID
export async function GET(
  req: NextRequest,
 context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: true, // optional: include related invoices
        quotations: true, // optional: include related quotations
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

// PATCH update a customer by ID
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, address },
    });

    return NextResponse.json(updatedCustomer);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

// DELETE a customer by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
