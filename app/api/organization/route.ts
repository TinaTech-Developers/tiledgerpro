// api/organization/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// get all organizations (for admin use, not exposed in UI)
export async function GET() {
  try {
    const orgs = await prisma.organization.findMany();
    return NextResponse.json(orgs);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

// POST create organization (initial setup)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, taxId } = body;

    const org = await prisma.organization.create({
      data: { name, address, taxId },
    });

    return NextResponse.json(org, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
