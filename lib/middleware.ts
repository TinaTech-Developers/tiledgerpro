import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token); // returns { userId, organizationId }
    // attach decoded info to request for API routes
    (req as any).user = decoded;

    return req;
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 },
    );
  }
}
