export const runtime = "nodejs";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const org = await prisma.organization.create({
    data: {
      name: "Test Company",
    },
  });

  return Response.json(org);
}
