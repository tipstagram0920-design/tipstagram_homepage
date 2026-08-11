import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddProductClient } from "./AddProductClient";

export const dynamic = "force-dynamic";

export default async function AddProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, products] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        purchases: {
          select: { id: true, productId: true, amount: true, refundedAt: true, createdAt: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, price: true },
      orderBy: { order: "asc" },
    }),
  ]);
  if (!user) notFound();

  // 상품별 현재 상태 — 접근 권한은 전 서비스가 refundedAt = null 로 판단한다
  const owned = user.purchases.map((p) => ({
    productId: p.productId,
    purchaseId: p.id,
    amount: p.amount,
    revokedAt: p.refundedAt ? p.refundedAt.toISOString() : null,
    grantedAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">수강권 직접 부여</h1>
      <p className="text-sm text-neutral-500 mb-8">{user.name || user.email}</p>
      <AddProductClient userId={user.id} products={products} owned={owned} />
    </div>
  );
}
