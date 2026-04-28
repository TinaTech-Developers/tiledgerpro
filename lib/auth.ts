import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: string;
  organizationId: string;
  email?: string;
  role?: string;
};

const JWT_SECRET = process.env.JWT_SECRET!;

export function getAuthUser(req: NextRequest): AuthUser | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") return null;

    return decoded as AuthUser;
  } catch {
    return null;
  }
}
