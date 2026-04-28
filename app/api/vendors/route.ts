export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET vendors
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    const vendors = await prisma.vendor.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendors);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 },
    );
  }
}

// CREATE vendor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, organizationId } = body;

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Name and organizationId are required" },
        { status: 400 },
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        organizationId,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 },
    );
  }
}
