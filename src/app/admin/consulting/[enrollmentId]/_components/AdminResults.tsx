"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { GUIDE_LABELS } from "@/components/consulting/guides/TaskGuide";
import { buildProfiles } from "@/components/consulting/guides/CustomerSelectGuide";
import { assembleLanding } from "@/components/consulting/guides/LandingPageGuide";

interface ResultTask {
  id: string;
  day: number;
  title: string;
  guideKey: string | null;
  data: unknown;
  doneAt: string | null;
}

function hasData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  return Object.values(data as Record<string, unknown>).some((v) => {
    if (Array.isArray(v)) return v.some((x) => x && Object.values(x).some((y) => (y as string)?.toString().trim()));
    return (v as string)?.toString().trim();
  });
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="py-1">
      <p className="text-[11px] font-bold text-neutral-500">{label}</p>
      <p className="text-[13px] text-neutral-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url?: string }) {
  if (!url || !url.trim()) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 text-[13px] text-pink-600 hover:underline">
      <span className="text-[11px] font-bold text-neutral-500 shrink-0">{label}</span>
      <span className="flex-1 min-w-0 truncate">{url}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
    </a>
  );
}

function ResultView({ guideKey, data }: { guideKey: string; data: unknown }) {
  const d = (data ?? {}) as Record<string, unknown>;
  if (guideKey === "customer-select") {
    const problems = Array.isArray(d.problems) ? (d.problems as string[]) : [];
    const versions = buildProfiles(
      problems.find((p) => p?.trim()) ?? "",
      (d.change as string) ?? "",
      (d.personaLine as string) ?? "",
      (d.expertise as string) ?? ""
    );
    return (
      <div className="space-y-1.5">
        <div>
          <p className="text-[11px] font-bold text-neutral-500">소비자 문제</p>
          <ul className="text-[13px] text-neutral-900 list-disc pl-4">
            {problems.filter((p) => p?.trim()).map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <Row label="해결 시 변화" value={d.change as string} />
        <Row label="페르소나" value={d.personaLine as string} />
        <Row label="페르소나 상세" value={d.personaDetail as string} />
        <Row label="전문성" value={d.expertise as string} />
        <div className="pt-1">
          <p className="text-[11px] font-bold text-neutral-500 mb-1">추천 프로필</p>
          <div className="space-y-1.5">
            {versions.map((v) => (
              <div key={v.name} className="rounded-lg border border-neutral-200 bg-white p-2">
                <p className="text-[11px] font-bold text-neutral-500 mb-0.5">{v.name}</p>
                <p className="text-[13px] text-neutral-900 whitespace-pre-wrap">{v.lines.join("\n")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (guideKey === "inpock-link") {
    return (
      <div>
        <LinkRow label="무료·이벤트" url={d.freeUrl as string} />
        <LinkRow label="후기" url={d.reviewUrl as string} />
        <LinkRow label="상품/FAQ" url={d.productUrl as string} />
        <LinkRow label="상담" url={d.consultUrl as string} />
      </div>
    );
  }
  if (guideKey === "highlight") {
    return <LinkRow label="상담하러 가기 URL" url={d.consultUrl as string} />;
  }
  if (guideKey === "landing-page") {
    const out = assembleLanding(d as Record<string, string>);
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-2.5 text-[13px] text-neutral-900 whitespace-pre-wrap leading-relaxed">
        {out || "작성 내용 없음"}
      </div>
    );
  }
  if (guideKey === "reels-reference") {
    const refs = Array.isArray(d.refs) ? (d.refs as { url?: string; account?: string; note?: string }[]) : [];
    return (
      <div className="space-y-1">
        {refs.filter((r) => r.url?.trim() || r.account?.trim()).map((r, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
            <LinkRow label={`${i + 1}`} url={r.url} />
            {(r.account || r.note) && (
              <p className="text-[12px] text-neutral-500">{[r.account, r.note].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (guideKey === "reels-upload") {
    const uploads = Array.isArray(d.uploads) ? (d.uploads as { url?: string; note?: string }[]) : [];
    const done = uploads.filter((u) => u.url?.trim()).length;
    return (
      <div className="space-y-1">
        <p className="text-[12px] font-bold text-neutral-600">업로드 {done}/5</p>
        {uploads.filter((u) => u.url?.trim()).map((u, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
            <LinkRow label={`릴스 ${i + 1}`} url={u.url} />
            {u.note && <p className="text-[12px] text-neutral-500">{u.note}</p>}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AdminResults({ tasks }: { tasks: ResultTask[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const guided = tasks.filter((t) => t.guideKey).sort((a, b) => a.day - b.day);

  if (guided.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden mb-6">
      {guided.map((t, i) => {
        const filled = hasData(t.data);
        const open = openId === t.id;
        return (
          <div key={t.id} className={i === guided.length - 1 ? "" : "border-b border-neutral-100"}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : t.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50/70"
            >
              <span className="shrink-0 w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 text-[11px] font-black flex items-center justify-center">
                D{t.day}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{t.title}</p>
                <p className="text-[11px] text-neutral-400">{GUIDE_LABELS[t.guideKey!] ?? "도우미"}</p>
              </div>
              {filled ? (
                <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 제출됨
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
                  <Circle className="w-3.5 h-3.5" /> 미제출
                </span>
              )}
              <ChevronDown className={"w-4 h-4 text-neutral-400 transition-transform " + (open ? "rotate-180" : "")} />
            </button>
            {open && (
              <div className="px-4 pb-4 pt-1 bg-neutral-50/40">
                {filled ? (
                  <ResultView guideKey={t.guideKey!} data={t.data} />
                ) : (
                  <p className="text-[13px] text-neutral-400">아직 고객이 작성한 내용이 없어요.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
