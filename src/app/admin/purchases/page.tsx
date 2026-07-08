import { prisma } from "@/lib/prisma";
import { PurchasesClient } from "./PurchasesClient";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { id: true, slug: true, title: true } },
    },
  });

  const items = purchases.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    amount: p.amount,
    createdAt: p.createdAt.toISOString(),
    refundedAt: p.refundedAt?.toISOString() ?? null,
    refundReason: p.refundReason,
    refundedBy: p.refundedBy,
    userName: p.user.name,
    userEmail: p.user.email,
    userId: p.user.id,
    productSlug: p.product.slug,
    productTitle: p.product.title,
  }));

  const activeTotal = items.filter((p) => !p.refundedAt).reduce((s, p) => s + p.amount, 0);
  const refundedTotal = items.filter((p) => p.refundedAt).reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">구매 · 환불 관리</h1>
        <p className="text-sm text-neutral-500 mt-1">
          전체 구매 목록에서 환불 처리를 진행할 수 있습니다. 환불 처리 시 해당 사용자의 강의실 접근이 즉시 차단되고 확인 이메일이 자동 발송됩니다.
        </p>
      </div>
      <PurchasesClient
        items={items}
        activeTotal={activeTotal}
        refundedTotal={refundedTotal}
      />
    </div>
  );
}
