import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">상품 수정</h1>
      <ProductForm product={product} />
    </div>
  );
}
