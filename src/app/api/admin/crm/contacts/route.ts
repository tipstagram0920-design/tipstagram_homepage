import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const source = searchParams.get("source") || "";
  const hasPurchase = searchParams.get("hasPurchase") === "1";
  const hasUser = searchParams.get("hasUser") === "1";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (source) where.source = source;
  if (hasPurchase) where.purchaseCount = { gt: 0 };
  if (hasUser) where.user = { isNot: null };

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { lastSeenAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, role: true, tags: true } },
      _count: { select: { events: true, liveSignups: true } },
    },
  });

  return NextResponse.json({ contacts });
}
