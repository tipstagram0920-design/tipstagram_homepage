import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddProductClient } from "./AddProductClient";

export default async function AddProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, products] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, purchases: { select: { productId: true } } } }),
    prisma.product.findMany({ where: { isActive: true }, select: { id: true, title: true, price: true }, orderBy: { order: "asc" } }),
  ]);
  if (!user) notFound();

  const ownedProductIds = user.purchases.map((p) => p.productId);

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">수강권 직접 부여</h1>
      <p className="text-sm text-neutral-500 mb-8">{user.name || user.email}</p>
      <AddProductClient userId={user.id} products={products} ownedProductIds={ownedProductIds} />
    </div>
  );
}
