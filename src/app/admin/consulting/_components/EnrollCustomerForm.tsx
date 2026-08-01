"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, UserPlus } from "lucide-react";
import { kstLocalToUtcISO } from "@/lib/kst";

/**
 * 관리자가 1:1 컨설팅 고객을 직접 등록하는 폼.
 * 등록하면 3주(21일) 할 일이 자동 생성되고, 첫 번째 할 일에 아래 "등록 메모"가 들어간다.
 */
export function EnrollCustomerForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [intakeNote, setIntakeNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || saving) return;
    setError("");
    setDone("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/consulting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          intakeNote: intakeNote.trim(),
          startAt: startDate ? kstLocalToUtcISO(`${startDate}T00:00`) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "등록에 실패했어요.");
        return;
      }
      setDone("등록 완료. 3주 할 일이 생성되었습니다.");
      setEmail("");
      setStartDate("");
      setIntakeNote("");
      router.refresh();
      setTimeout(() => setDone(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 mt-4">
      <h2 className="text-base font-bold text-neutral-800 inline-flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4 text-pink-500" /> 고객 직접 등록
      </h2>
      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        가입된 회원의 이메일로 바로 등록합니다. 등록 즉시 3주(21일) 할 일이 자동 생성되고,
        아래 등록 메모는 <span className="font-semibold text-neutral-700">첫 번째 할 일</span> 설명 맨 위에 들어가요.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              고객 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="customer@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              시작일 (Day 1) · 비우면 오늘
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(ev) => setStartDate(ev.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            등록 메모 (첫 번째 할 일에 표시)
          </label>
          <textarea
            value={intakeNote}
            onChange={(ev) => setIntakeNote(ev.target.value)}
            rows={4}
            placeholder="예: 계정 @tipstagram · 판매 상품은 온라인 강의. 첫 상담에서 나온 목표는 3주 안에 문의 10건."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm leading-relaxed focus:outline-none focus:border-pink-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {done && (
          <p className="text-sm text-green-600 inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {done}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !email.trim()}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          등록하고 3주 할 일 생성
        </button>
      </form>
    </div>
  );
}
