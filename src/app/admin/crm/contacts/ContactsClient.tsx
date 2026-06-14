"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Radio, UserPlus, Ban, Settings2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  liveSignupCount: number;
  purchaseCount: number;
  totalSpent: number;
  unsubscribed: boolean;
  hasUser: boolean;
  userRole: string | null;
  userTags: string[];
  eventCount: number;
}

type Filter = "all" | "live" | "user" | "buyer";

export function ContactsClient({ initial }: { initial: Contact[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return initial.filter((c) => {
      if (ql && !(c.email.includes(ql) || c.name?.toLowerCase().includes(ql))) return false;
      if (filter === "live" && c.liveSignupCount === 0) return false;
      if (filter === "user" && !c.hasUser) return false;
      if (filter === "buyer" && c.purchaseCount === 0) return false;
      return true;
    });
  }, [initial, q, filter]);

  return (
    <div>
      {/* 고급 작업 안내 */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-pink-500"
        >
          <Settings2 className="w-3.5 h-3.5" />
          회원 일괄 작업 (CSV·태그 일괄·구매 부여)
        </Link>
      </div>

      {/* 검색 + 필터 */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름·이메일로 검색"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div className="flex gap-2">
          {([
            ["all", "전체"],
            ["live", "라이브 신청"],
            ["user", "회원"],
            ["buyer", "구매자"],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors " +
                (filter === key
                  ? "ig-gradient text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
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
          <div className="col-span-4">컨택트</div>
          <div className="col-span-2">상태</div>
          <div className="col-span-2">활동</div>
          <div className="col-span-2">총 결제</div>
          <div className="col-span-2">최근 활동</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">조건에 맞는 컨택트가 없습니다.</div>
        )}
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/admin/crm/contacts/${c.id}`}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors items-center"
          >
            <div className="md:col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full ig-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(c.name?.[0] || c.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{c.name || "이름 없음"}</p>
                <p className="text-xs text-neutral-500 truncate">{c.email}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-1.5">
              {c.hasUser && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">
                  {c.userRole === "ADMIN" ? "관리자" : "회원"}
                </span>
              )}
              {!c.hasUser && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">리드</span>
              )}
              {c.unsubscribed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 inline-flex items-center gap-1">
                  <Ban className="w-2.5 h-2.5" /> 수신거부
                </span>
              )}
              {c.userTags.slice(0, 2).map((t) => (
                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                  #{t}
                </span>
              ))}
            </div>
            <div className="md:col-span-2 flex items-center gap-3 text-xs text-neutral-600">
              {c.liveSignupCount > 0 && (
                <span className="inline-flex items-center gap-1"><Radio className="w-3 h-3 text-amber-500" />{c.liveSignupCount}</span>
              )}
              {c.purchaseCount > 0 && (
                <span className="inline-flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-emerald-500" />{c.purchaseCount}</span>
              )}
              {c.hasUser && c.purchaseCount === 0 && (
                <span className="inline-flex items-center gap-1"><UserPlus className="w-3 h-3 text-blue-500" />가입</span>
              )}
            </div>
            <div className="md:col-span-2 text-sm font-semibold text-neutral-800">
              {c.totalSpent > 0 ? formatPrice(c.totalSpent) : <span className="text-neutral-300">-</span>}
            </div>
            <div className="md:col-span-2 text-xs text-neutral-400">{formatDate(new Date(c.lastSeenAt))}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
