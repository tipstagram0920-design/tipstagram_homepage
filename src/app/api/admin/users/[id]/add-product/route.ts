import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { productId } = await req.json();

  const existing = await prisma.purchase.findFirst({ where: { userId, productId } });
  if (existing) return NextResponse.json({ error: "이미 보유한 강의입니다." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  const purchase = await prisma.purchase.create({
    data: { userId, productId, amount: 0, orderId: generateOrderId() },
  });

  return NextResponse.json(purchase);
}
