"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, X, ExternalLink, AlertTriangle } from "lucide-react";
import { kstLocalToUtcISO, toKstLocalDateTime } from "@/lib/kst";

type Cohort = { id: string; name: string; week1StartAt: string; openChatUrl: string | null };
type Checklist = { ok: boolean; label: string; hint?: string; href?: string }[];

interface Initial {
  id: string;
  title: string;
  startsAt: string;
  youtubeUrl: string;
  replayUrl: string;
  signupCloseAt: string;
  salesCloseAt: string;
  chatUrl: string;
  cohortId: string;
  cohortChatUrl: string;
  campaignId: string | null;
}

const addDaysLocal = (local: string, days: number, hhmm?: string) => {
  if (!local) return "";
  const d = new Date(kstLocalToUtcISO(local));
  d.setUTCDate(d.getUTCDate() + days);
  const out = toKstLocalDateTime(d.toISOString());
  return hhmm ? out.slice(0, 10) + "T" + hhmm : out;
};

export function LiveOpsClient({
  lives,
  cohorts,
  initial,
  checklist,
}: {
  lives: { id: string; title: string; startsAt: string }[];
  cohorts: Cohort[];
  initial: Initial | null;
  checklist: Checklist;
}) {
  const router = useRouter();
  const [f, setF] = useState<Initial>(
    initial ?? {
      id: "",
      title: "",
      startsAt: "",
      youtubeUrl: "",
      replayUrl: "",
      signupCloseAt: "",
      salesCloseAt: "",
      chatUrl: "",
      cohortId: "",
      cohortChatUrl: "",
      campaignId: null,
    }
  );
  const [newCohort, setNewCohort] = useState<{ on: boolean; name: string; week1StartAt: string }>({ on: false, name: "", week1StartAt: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (patch: Partial<Initial>) => setF((p) => ({ ...p, ...patch }));

  // 라이브 일시를 넣으면 비어 있는 마감들을 관례대로 채운다 (다시보기 72시간 · 신청은 시작 직전)
  const onStartsAt = (v: string) => {
    set({
      startsAt: v,
      signupCloseAt: f.signupCloseAt || v,
      salesCloseAt: f.salesCloseAt || addDaysLocal(v, 3, "23:59"),
    });
  };
  const onPickCohort = (id: string) => {
    const c = cohorts.find((x) => x.id === id);
    set({ cohortId: id, cohortChatUrl: c?.openChatUrl ?? "" });
  };

  const save = async () => {
    setMsg(null);
    if (!f.title.trim()) return setMsg({ ok: false, text: "라이브 제목을 입력하세요." });
    if (!f.startsAt) return setMsg({ ok: false, text: "라이브 일시를 선택하세요." });
    if (newCohort.on && !newCohort.week1StartAt) return setMsg({ ok: false, text: "새 기수 시작일을 선택하세요." });
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: f.id || undefined,
          title: f.title,
          startsAt: kstLocalToUtcISO(f.startsAt),
          youtubeUrl: f.youtubeUrl,
          replayUrl: f.replayUrl,
          signupCloseAt: f.signupCloseAt ? kstLocalToUtcISO(f.signupCloseAt) : null,
          salesCloseAt: f.salesCloseAt ? kstLocalToUtcISO(f.salesCloseAt) : null,
          chatUrl: f.chatUrl,
          cohortId: newCohort.on ? null : f.cohortId || null,
          newCohort: newCohort.on ? { name: newCohort.name, week1StartAt: kstLocalToUtcISO(newCohort.week1StartAt) } : null,
          cohortChatUrl: f.cohortChatUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ ok: false, text: data.error || "저장 실패" });
      setMsg({ ok: true, text: data.reseeded ? "저장됨 · 메일 11단계와 카톡 문안을 다시 깔았습니다." : "저장됨 · 연결된 곳에 반영했습니다." });
      router.push(`/admin/live-ops?id=${data.live.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400";
  const label = "block text-sm font-semibold text-neutral-800 mb-1.5";
  const hint = "text-xs text-neutral-500 mt-1.5";

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="space-y-5">
        {lives.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500">회차:</span>
            <Link href="/admin/live-ops?new=1" onClick={() => { setF({ ...f, id: "", title: "", startsAt: "", youtubeUrl: "", replayUrl: "", signupCloseAt: "", salesCloseAt: "", chatUrl: "", campaignId: null }); }} className="px-3 py-1.5 rounded-full border border-dashed border-neutral-300 text-neutral-600 hover:border-pink-400">
              + 새 라이브
            </Link>
            {lives.map((l) => (
              <Link key={l.id} href={`/admin/live-ops?id=${l.id}`} className={`px-3 py-1.5 rounded-full border ${l.id === f.id ? "border-pink-500 text-pink-600 font-bold" : "border-neutral-200 text-neutral-600 hover:border-pink-400"}`}>
                {toKstLocalDateTime(l.startsAt).slice(5, 10).replace("-", "/")} {l.title.slice(0, 14)}
              </Link>
            ))}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900">1. 라이브</h2>
          <div>
            <label className={label}>제목</label>
            <input className={field} value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="예: 인스타 팔로워+수익화 성장법 무료강의" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>라이브 일시 (KST)</label>
              <input type="datetime-local" className={field} value={f.startsAt} onChange={(e) => onStartsAt(e.target.value)} />
              <p className={hint}>메일 D-10 ~ 당일, 카톡 문안, 신청 페이지 날짜가 전부 여기서 계산됩니다.</p>
            </div>
            <div>
              <label className={label}>신청 마감</label>
              <input type="datetime-local" className={field} value={f.signupCloseAt} onChange={(e) => set({ signupCloseAt: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={label}>입장 링크 (유튜브 라이브 · 줌)</label>
            <input className={field} value={f.youtubeUrl} onChange={(e) => set({ youtubeUrl: e.target.value })} placeholder="https://youtube.com/live/..." />
            <p className={hint}>당일 "입장 링크" 메일과 카톡 문안에 들어갑니다. 초대장 전문을 붙여넣어도 첫 URL만 씁니다.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>다시보기 링크</label>
              <input className={field} value={f.replayUrl} onChange={(e) => set({ replayUrl: e.target.value })} placeholder="라이브 후 입력해도 됩니다" />
            </div>
            <div>
              <label className={label}>다시보기 · 판매 마감</label>
              <input type="datetime-local" className={field} value={f.salesCloseAt} onChange={(e) => set({ salesCloseAt: e.target.value })} />
              <p className={hint}>기본 = 라이브 +3일 23:59. "마감 D-3" 메일의 기준입니다.</p>
            </div>
          </div>
          <div>
            <label className={label}>라이브 오픈채팅방</label>
            <input className={field} value={f.chatUrl} onChange={(e) => set({ chatUrl: e.target.value })} placeholder="https://open.kakao.com/o/..." />
            <p className={hint}>신청 완료 메일 · 팁스킷 /live · 메타 광고 랜딩이 같은 주소를 받습니다.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900">2. 이 라이브에서 파는 5주 챌린지</h2>
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={() => setNewCohort((n) => ({ ...n, on: false }))} className={`px-3.5 py-2 rounded-xl border ${!newCohort.on ? "border-pink-500 text-pink-600 font-bold" : "border-neutral-200 text-neutral-600"}`}>기존 기수 연결</button>
            <button type="button" onClick={() => setNewCohort((n) => ({ ...n, on: true }))} className={`px-3.5 py-2 rounded-xl border ${newCohort.on ? "border-pink-500 text-pink-600 font-bold" : "border-neutral-200 text-neutral-600"}`}>새 기수 만들기</button>
          </div>
          {newCohort.on ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>기수 이름</label>
                <input className={field} value={newCohort.name} onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })} placeholder="예: 2026년 11월 기수 (비우면 자동)" />
              </div>
              <div>
                <label className={label}>Week 1 시작 (KST)</label>
                <input type="datetime-local" className={field} value={newCohort.week1StartAt} onChange={(e) => setNewCohort({ ...newCohort, week1StartAt: e.target.value })} />
                <p className={hint}>주차 5개 · 라이브 저녁 8시(3주차 토요일 오프라인) · 숙제 마감 +6일 밤 9시가 자동으로 깔립니다.</p>
              </div>
            </div>
          ) : (
            <div>
              <label className={label}>기수</label>
              <select className={field} value={f.cohortId} onChange={(e) => onPickCohort(e.target.value)}>
                <option value="">— 연결 안 함 —</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {toKstLocalDateTime(c.week1StartAt).slice(0, 10)} 시작</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={label}>기수 오픈채팅방</label>
            <input className={field} value={f.cohortChatUrl} onChange={(e) => set({ cohortChatUrl: e.target.value })} placeholder="https://open.kakao.com/o/..." />
            <p className={hint}>결제 직후 안내 페이지와 강의실의 입장 버튼. 기수마다 새 방을 여니 여기서 바꿉니다.</p>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="px-6 py-3 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {f.id ? "저장하고 전부 반영" : "라이브 만들고 전부 반영"}
          </button>
          {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>}
        </div>
      </div>

      <aside className="bg-white rounded-2xl border border-neutral-100 p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-bold text-neutral-900 mb-3">놓친 것 체크</h2>
        {checklist.length === 0 ? (
          <p className="text-xs text-neutral-500">저장하면 여기에 빠진 항목이 뜹니다.</p>
        ) : (
          <ul className="space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex gap-2.5 text-[13px]">
                <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${c.ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
                <span className="min-w-0">
                  <span className={c.ok ? "text-neutral-700" : "font-semibold text-neutral-900"}>{c.label}</span>
                  {!c.ok && c.hint && <span className="block text-[11px] text-neutral-500 mt-0.5">{c.hint}</span>}
                  {!c.ok && c.href && (
                    <Link href={c.href} className="inline-flex items-center gap-1 text-[11px] text-pink-600 font-semibold mt-0.5">
                      바로 가기 <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {f.campaignId && (
          <Link href={`/admin/crm/webinar/${f.campaignId}/edit`} className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-1 text-xs text-pink-600 font-semibold">
            메일 11단계 열어보기 <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        <p className="mt-4 pt-4 border-t border-neutral-100 text-[11px] text-neutral-400 leading-relaxed inline-flex gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          날짜·링크를 바꾸면 카톡 문안은 다시 생성됩니다(미발송분만). 이미 나간 메일은 되돌리지 않습니다.
        </p>
      </aside>
    </div>
  );
}
