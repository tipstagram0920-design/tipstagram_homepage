"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  price: number;
}

interface Props {
  userId: string;
  products: Product[];
  ownedProductIds: string[];
}

export function AddProductClient({ userId, products, ownedProductIds }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const grant = async (productId: string) => {
    setLoading(productId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      setDone((prev) => [...prev, productId]);
      router.refresh();
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-lg space-y-3">
      {products.map((product) => {
        const owned = ownedProductIds.includes(product.id) || done.includes(product.id);
        return (
          <div key={product.id} className="flex items-center justify-between bg-white rounded-2xl border border-neutral-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{product.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{product.price.toLocaleString()}원</p>
            </div>
            {owned ? (
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">보유 중</span>
            ) : (
              <button
                onClick={() => grant(product.id)}
                disabled={loading === product.id}
                className="text-xs font-bold px-4 py-2 rounded-xl ig-gradient text-white disabled:opacity-50"
              >
                {loading === product.id ? "처리 중..." : "부여"}
              </button>
            )}
          </div>
        );
      })}
      {products.length === 0 && (
        <p className="text-sm text-neutral-400">등록된 상품이 없습니다.</p>
      )}
    </div>
  );
}
