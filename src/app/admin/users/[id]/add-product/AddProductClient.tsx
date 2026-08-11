"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, RotateCcw } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
}

/** 이 사용자가 이미 가진(또는 취소된) 수강권 */
interface Owned {
  productId: string;
  purchaseId: string;
  amount: number;
  /** 취소된 시각. null 이면 현재 유효 */
  revokedAt: string | null;
  grantedAt: string;
}

interface Props {
  userId: string;
  products: Product[];
  owned: Owned[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function AddProductClient({ userId, products, owned }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  // 취소 확인 대기 중인 상품
  const [confirming, setConfirming] = useState<string | null>(null);

  const ownedOf = (productId: string) => owned.find((o) => o.productId === productId) ?? null;

  const call = async (productId: string, action: "grant" | "revoke") => {
    setLoading(productId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/add-product`, {
        method: action === "grant" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }
      setConfirming(null);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-lg space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      {products.map((product) => {
        const o = ownedOf(product.id);
        const active = o && !o.revokedAt; // 현재 수강 가능
        const revoked = o && o.revokedAt; // 부여했다가 취소함
        const busy = loading === product.id;

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-neutral-100 px-5 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900">{product.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {product.price.toLocaleString()}원
                  {active && ` · ${fmtDate(o!.grantedAt)} 부여`}
                  {revoked && ` · ${fmtDate(o!.revokedAt!)} 취소됨`}
                </p>
              </div>

              <div className="shrink-0">
                {active ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                      보유 중
                    </span>
                    <button
                      onClick={() => setConfirming(product.id)}
                      disabled={busy}
                      className="text-xs font-bold px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                    >
                      부여 취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => call(product.id, "grant")}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl ig-gradient text-white disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : revoked ? (
                      <RotateCcw className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    {busy ? "처리 중..." : revoked ? "다시 부여" : "부여"}
                  </button>
                )}
              </div>
            </div>

            {/* 취소 확인 — 수강 접근이 즉시 끊기므로 한 번 더 묻는다 */}
            {confirming === product.id && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[13px] text-red-700 leading-6">
                  <strong>{product.title}</strong> 수강권을 취소하면 이 회원은 해당 강의에
                  <strong> 즉시 접근할 수 없게 됩니다.</strong> 챌린지·컨설팅 등 이 상품으로 열린 기능도 함께 막힙니다.
                  기록은 남아 있어 언제든 다시 부여할 수 있습니다.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => call(product.id, "revoke")}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                    {busy ? "취소 중..." : "네, 취소합니다"}
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100"
                  >
                    그대로 두기
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {products.length === 0 && <p className="text-sm text-neutral-400">등록된 상품이 없습니다.</p>}
    </div>
  );
}
