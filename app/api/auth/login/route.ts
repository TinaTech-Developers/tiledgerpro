import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 },
      );
    }

    // 2️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 3️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 4️⃣ Pick default organization (first one for now)
    const membership = user.memberships[0];

    if (!membership) {
      return NextResponse.json(
        { success: false, message: "User not linked to any organization" },
        { status: 403 },
      );
    }

    // 5️⃣ Create JWT token (VERY IMPORTANT)
    const token = signToken({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId, // 🔥 multi-tenant security
      role: membership.role,
    });

    // 6️⃣ Return response
    return NextResponse.json({
      success: true,
      token, // 🔥 frontend will store this
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 },
    );
  }
}
