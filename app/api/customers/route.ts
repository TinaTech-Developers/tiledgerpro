// /app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { authMiddleware } from "@/lib/middleware";

// GET all customers for an organization
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);

    if (!user || user instanceof NextResponse) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (user as any).user.organizationId;

    const customers = await prisma.customer.findMany({
      where: { organizationId },
      include: {
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

// POST create a new customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // ✅ GET USER FROM AUTH MIDDLEWARE (IMPORTANT)
    const user = await authMiddleware(req);

    if (!user || user instanceof NextResponse) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (user as any).user.organizationId;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        organization: {
          connect: { id: organizationId },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
// PATCH update customer
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phone, address } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, address },
    });

    return NextResponse.json(customer);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

// DELETE customer
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    await prisma.customer.delete({ where: { id } });

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
