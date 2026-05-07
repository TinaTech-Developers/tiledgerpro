export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "@/lib/jwt";

function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") return null;

  return decoded as {
    userId: string;
    organizationId: string;
  };
}

// GET organization (FOR SETTINGS PAGE)
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    return NextResponse.json(org);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch organization" },
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
