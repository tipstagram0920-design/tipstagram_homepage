"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, RotateCcw, CheckCircle2, XCircle, Loader2, User as UserIcon } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

interface Item {
  id: string;
  orderId: string;
  amount: number;
  createdAt: string;
  refundedAt: string | null;
  refundReason: string | null;
  refundedBy: string | null;
  userName: string | null;
  userEmail: string;
  userId: string;
  productSlug: string;
  productTitle: string;
}

type Filter = "all" | "active" | "refunded";

export function PurchasesClient({
  items,
  activeTotal,
  refundedTotal,
}: {
  items: Item[];
  activeTotal: number;
  refundedTotal: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [refunding, setRefunding] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((p) => {
      if (filter === "active" && p.refundedAt) return false;
      if (filter === "refunded" && !p.refundedAt) return false;
      if (ql) {
        const hit =
          p.userEmail.toLowerCase().includes(ql) ||
          p.userName?.toLowerCase().includes(ql) ||
          p.orderId.toLowerCase().includes(ql) ||
          p.productTitle.toLowerCase().includes(ql);
        if (!hit) return false;
      }
      return true;
    });
  }, [items, q, filter]);

  const refund = async (item: Item) => {
    const reason = window.prompt(
      `"${item.productTitle}"\n${item.userEmail} · ${formatPrice(item.amount)}\n\n환불 사유(선택, 500자 이내)를 입력하세요.`,
      ""
    );
    if (reason === null) return; // 취소
    if (!confirm(`정말 환불하시겠어요? 사용자에게 즉시 이메일이 발송되고 강의실 접근이 차단됩니다.`)) return;

    setRefunding(item.id);
    try {
      const res = await fetch(`/api/admin/purchases/${item.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "환불 처리 실패");
        return;
      }
      router.refresh();
    } finally {
      setRefunding(null);
    }
  };

  return (
    <div>
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="전체 구매" value={items.length + "건"} />
        <Kpi label="유효 매출" value={formatPrice(activeTotal)} accent />
        <Kpi label="환불 건수" value={items.filter((p) => p.refundedAt).length + "건"} />
        <Kpi label="환불 총액" value={formatPrice(refundedTotal)} tone="red" />
      </div>

      {/* 검색 + 필터 */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이메일·이름·주문번호·상품명 검색"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div className="flex gap-2">
          {([
            ["all", "전체"],
            ["active", "유효"],
            ["refunded", "환불"],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors " +
                (filter === key ? "ig-gradient text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          <div className="col-span-3">고객</div>
          <div className="col-span-3">상품</div>
          <div className="col-span-2">금액 · 결제일</div>
          <div className="col-span-2">상태</div>
          <div className="col-span-2 text-right">액션</div>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">조건에 맞는 구매가 없어요.</div>
        )}

        {filtered.map((p) => (
          <div
            key={p.id}
            className={
              "grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 border-b border-neutral-50 last:border-0 items-center " +
              (p.refundedAt ? "bg-red-50/40" : "hover:bg-neutral-50")
            }
          >
            <div className="md:col-span-3 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full ig-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(p.userName?.[0] || p.userEmail[0]).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{p.userName || "이름 없음"}</p>
                <p className="text-xs text-neutral-500 truncate">{p.userEmail}</p>
              </div>
            </div>
            <div className="md:col-span-3 min-w-0">
              <Link href={`/courses/${p.productSlug}`} className="text-sm font-medium text-neutral-800 hover:text-pink-500 truncate block">
                {p.productTitle}
              </Link>
              <p className="text-[11px] text-neutral-400 font-mono truncate">{p.orderId}</p>
            </div>
            <div className="md:col-span-2 min-w-0">
              <p className="text-sm font-bold text-neutral-900">
                {p.amount === 0 ? <span className="text-neutral-500 text-xs">번들 보너스</span> : formatPrice(p.amount)}
              </p>
              <p className="text-xs text-neutral-400">{formatDate(p.createdAt)}</p>
            </div>
            <div className="md:col-span-2">
              {p.refundedAt ? (
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    <XCircle className="w-3 h-3" /> 환불됨
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">{formatDate(p.refundedAt)}</p>
                  {p.refundReason && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate" title={p.refundReason}>{p.refundReason}</p>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> 유효
                </span>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Link
                href={`/admin/users/${p.userId}`}
                className="p-2 rounded-lg text-neutral-400 hover:text-pink-500 hover:bg-pink-50"
                title="회원 상세"
              >
                <UserIcon className="w-4 h-4" />
              </Link>
              {!p.refundedAt && p.amount > 0 && (
                <button
                  onClick={() => refund(p)}
                  disabled={refunding === p.id}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {refunding === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                  환불
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        ⚠ 실제 카드 결제 취소는 페이플 백오피스에서 별도 처리해주세요. 이 화면의 "환불"은 tipstagram DB 상 구매 무효화 + 수강 접근 차단 + 안내 메일 발송입니다.
      </p>
    </div>
  );
}

function Kpi({ label, value, accent, tone }: { label: string; value: string; accent?: boolean; tone?: "red" }) {
  return (
    <div className={"rounded-2xl border p-4 " + (accent ? "bg-pink-50 border-pink-200" : "bg-white border-neutral-100")}>
      <p className="text-xs font-semibold text-neutral-500">{label}</p>
      <p className={"mt-1 text-xl font-black " + (tone === "red" ? "text-red-600" : accent ? "ig-gradient-text" : "text-neutral-900")}>{value}</p>
    </div>
  );
}
