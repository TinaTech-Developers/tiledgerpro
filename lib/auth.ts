import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export type AuthUser = {
  userId: string;
  organizationId: string;
  email?: string;
  role?: string;
};

export function getAuthUser(req: NextRequest): AuthUser | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (typeof decoded === "string") return null;

    return decoded as AuthUser;
  } catch {
    return null;
  }
}
