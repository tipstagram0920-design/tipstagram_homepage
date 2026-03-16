import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code, discount, type, maxUses, expiresAt, productId } = await req.json();

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discount,
      type,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      productId: productId || null,
    },
  });

  return NextResponse.json(coupon);
}
