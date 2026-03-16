"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  maxUses: number | null;
  uses: number;
  expiresAt: Date | null;
  isActive: boolean;
  product: { title: string } | null;
}

export function CouponManageClient({
  coupons: initialCoupons,
  products,
}: {
  coupons: Coupon[];
  products: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "PERCENT",
    maxUses: "",
    expiresAt: "",
    productId: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discount: parseInt(form.discount),
          type: form.type,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          productId: form.productId || null,
        }),
      });
      if (!res.ok) throw new Error("생성 실패");
      router.refresh();
      setShowForm(false);
      setForm({ code: "", discount: "", type: "PERCENT", maxUses: "", expiresAt: "", productId: "" });
    } catch {
      alert("쿠폰 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("쿠폰을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      {/* Create button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl ig-gradient text-white font-semibold text-sm mb-6"
      >
        <Plus className="w-4 h-4" /> 쿠폰 생성
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <h3 className="font-bold text-neutral-900 mb-5">새 쿠폰 생성</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">쿠폰 코드 *</label>
              <input required type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">할인 값 *</label>
              <input required type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="할인율 또는 금액"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">할인 방식</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400">
                <option value="PERCENT">퍼센트 (%)</option>
                <option value="AMOUNT">금액 (원)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">최대 사용 횟수</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="무제한 (비워두기)"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">만료일</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">특정 강의 전용</label>
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400">
                <option value="">전체 강의 적용</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">
              취소
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
              {loading ? "생성 중..." : "쿠폰 생성"}
            </button>
          </div>
        </form>
      )}

      {/* Coupon list */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">생성된 쿠폰이 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">코드</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">할인</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">사용</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">만료일</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">상태</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3.5 font-mono text-sm font-bold text-neutral-900">{c.code}</td>
                  <td className="px-5 py-3.5 text-sm text-neutral-700">
                    {c.discount}{c.type === "PERCENT" ? "%" : "원"}
                    {c.product && <span className="ml-1.5 text-xs text-neutral-400">({c.product.title})</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">
                    {c.uses}{c.maxUses ? `/${c.maxUses}` : ""}회
                  </td>
                  <td className="px-5 py-3.5 text-xs text-neutral-400">
                    {c.expiresAt ? formatDate(c.expiresAt) : "무제한"}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleCoupon(c.id, c.isActive)}>
                      {c.isActive
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6 text-neutral-300" />}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => deleteCoupon(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
