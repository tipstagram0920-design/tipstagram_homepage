import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userIds, action, payload } = body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "userIds required" }, { status: 400 });
  }

  try {
    switch (action) {
      case "addTags": {
        const { tags } = payload as { tags: string[] };
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, tags: true },
        });
        await Promise.all(
          users.map((u) => {
            const newTags = Array.from(new Set([...u.tags, ...tags]));
            return prisma.user.update({ where: { id: u.id }, data: { tags: newTags } });
          })
        );
        return NextResponse.json({ ok: true, count: userIds.length });
      }

      case "removeTags": {
        const { tags } = payload as { tags: string[] };
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, tags: true },
        });
        await Promise.all(
          users.map((u) => {
            const newTags = u.tags.filter((t) => !tags.includes(t));
            return prisma.user.update({ where: { id: u.id }, data: { tags: newTags } });
          })
        );
        return NextResponse.json({ ok: true, count: userIds.length });
      }

      case "setRole": {
        const { role } = payload as { role: string };
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: role as "USER" | "ADMIN" },
        });
        return NextResponse.json({ ok: true, count: userIds.length });
      }

      case "delete": {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        return NextResponse.json({ ok: true, count: userIds.length });
      }

      case "addProduct": {
        const { productId } = payload as { productId: string };
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

        const existing = await prisma.purchase.findMany({
          where: { productId, userId: { in: userIds } },
          select: { userId: true },
        });
        const existingIds = new Set(existing.map((p) => p.userId));
        const toCreate = userIds.filter((id) => !existingIds.has(id));

        await Promise.all(
          toCreate.map((userId) =>
            prisma.purchase.create({
              data: { userId, productId, amount: 0, orderId: generateOrderId() },
            })
          )
        );
        return NextResponse.json({ ok: true, count: toCreate.length });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 실패" }, { status: 500 });
  }
}
