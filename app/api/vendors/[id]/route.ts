export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// =========================
// GET SINGLE VENDOR
// =========================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: (await context.params).id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 },
    );
  }
}

// =========================
// UPDATE VENDOR
// =========================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const { name, email, phone } = body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: (await context.params).id },
      data: { name, email, phone },
    });

    return NextResponse.json(updatedVendor);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 },
    );
  }
}

// =========================
// DELETE VENDOR
// =========================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await prisma.vendor.delete({
      where: { id: (await context.params).id },
    });

    return NextResponse.json({
      message: "Vendor deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 },
    );
  }
}
