import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { purchases: true } } },
  }).catch(() => []);
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-neutral-900">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl ig-gradient text-white font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> 상품 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">등록된 상품이 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">상품명</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">가격</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">구매</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">상태</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        {p.thumbnail
                          ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full ig-gradient flex items-center justify-center text-white text-sm font-bold italic">T</div>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{p.title}</p>
                        <p className="text-xs text-neutral-400">/courses/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-neutral-900">{formatPrice(p.price)}</td>
                  <td className="px-5 py-4 text-sm text-neutral-600">{p._count.purchases}명</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                      {p.isActive ? "판매중" : "비공개"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900"
                    >
                      <Pencil className="w-3.5 h-3.5" /> 수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
