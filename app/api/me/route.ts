export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") return null;

  return decoded;
}

export async function GET(req: NextRequest) {
  const user = getUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}
