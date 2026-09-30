"use client";

import { useEffect, useRef, useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  FeedbackButton,
  FeedbackBox,
  PrefillButton,
  FIELD,
  FLABEL,
} from "./common";
import { Youtube, ExternalLink, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import type { GuideContext } from "@/lib/consulting-guide-data";

interface Data {
  freeUrl?: string;
  reviewUrl?: string;
  productUrl?: string;
  consultUrl?: string;
  prefilled?: boolean;
}

const STEPS = [
  { n: 1, key: "freeUrl", label: "무료 자료 또는 이벤트", tip: "가장 위에! 부담 없이 클릭하게 만드는 미끼. 무료자료 신청 링크나 진행 중인 이벤트를 연결." },
  { n: 2, key: "reviewUrl", label: "고객 후기", tip: "신뢰를 쌓는 단계. 후기 모음(캡처·페이지)을 연결." },
  { n: 3, key: "productUrl", label: "상품 안내 또는 자주 묻는 질문(FAQ)", tip: "관심이 생긴 사람에게 상세 정보. 상품 소개 랜딩 또는 FAQ 페이지." },
  { n: 4, key: "consultUrl", label: "상담하기", tip: "마지막은 전환. 상담·문의 링크(카톡·폼)로 연결." },
] as const;

/** 어느 숙제에서 만든 페이지가 어느 버튼으로 가는지 */
const SOURCE: Record<string, { guideKey: string; label: string }> = {
  freeUrl: { guideKey: "freebie-page", label: "무료자료·체험·이벤트 페이지 만들기" },
  reviewUrl: { guideKey: "proof-page", label: "후기·변화 스토리 페이지 만들기" },
  productUrl: { guideKey: "faq-page", label: "자주 묻는 질문 페이지 만들기" },
  consultUrl: { guideKey: "landing-page", label: "상담·주문 페이지 글 쓰기" },
};

export function InpockLinkGuide({
  taskId,
  initialData,
  context,
  siblings,
}: {
  taskId: string;
  initialData: Data | null;
  context?: GuideContext | null;
  /** 앞 숙제로 돌아갈 링크를 걸기 위한 같은 등록의 숙제 목록 */
  siblings?: { id: string; guideKey: string | null }[];
}) {
  const [data, setData] = useState<Data>(initialData ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, data);

  // 앞 숙제에서 만든 페이지 주소
  const pages = context?.pages;
  const prefill: Data = {
    freeUrl: pages?.freebieUrl ?? "",
    reviewUrl: pages?.proofUrl ?? "",
    productUrl: pages?.faqUrl ?? "",
    consultUrl: pages?.contactUrl ?? "",
  };
  const prefillCount = Object.values(prefill).filter((v) => (v ?? "").trim()).length;

  // 처음 들어왔고 아직 아무것도 안 넣었다면 앞 숙제 주소로 채워준다
  const [autoFilled, setAutoFilled] = useState(false);
  const didAutoFill = useRef(false);
  useEffect(() => {
    if (didAutoFill.current || prefillCount === 0 || initialData?.prefilled) return;
    const empty = !STEPS.some((s) => (initialData?.[s.key] || "").trim());
    if (!empty) return;
    didAutoFill.current = true;
    setData((prev) => ({ ...prev, ...prefill, prefilled: true }));
    setAutoFilled(true);
    // prefill 은 context 파생값이라 매 렌더 새로 만들어진다 → 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillCount, initialData]);

  const applyPrefill = () =>
    setData((prev) => {
      const merged: Data = { ...prev, prefilled: true };
      for (const s of STEPS) {
        if (!(merged[s.key] || "").trim()) merged[s.key] = prefill[s.key] ?? "";
      }
      return merged;
    });

  const set = (k: keyof Data, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const taskHref = (guideKey: string) => {
    const t = siblings?.find((s) => s.guideKey === guideKey);
    return t ? `/consulting/${t.id}` : null;
  };

  const [show, setShow] = useState(Boolean(STEPS.some((s) => (initialData?.[s.key] || "").trim())));
  const getFeedback = () => {
    save(data);
    setShow(true);
  };

  const filled = STEPS.filter((s) => (data[s.key] || "").trim()).length;
  const missing = STEPS.filter((s) => !(data[s.key] || "").trim());

  const notes: string[] = [];
  if (!(data.freeUrl || "").trim()) notes.push("맨 위 '무료·이벤트' 링크가 비어 있어요. 첫 버튼이 가장 중요해요.");
  if (!(data.consultUrl || "").trim()) notes.push("마지막 '상담하기' 링크를 꼭 넣으세요. 전환이 여기서 일어나요.");
  if (filled === 4) notes.push("4개 버튼 링크를 모두 채웠어요. 순서만 위 순서대로 배치하면 완성!");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {/* 준비 상태 — 앞 숙제에서 페이지를 만들었는지부터 확인시킨다 */}
      <div
        className={
          "rounded-xl border p-4 " +
          (missing.length === 0 ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/60")
        }
      >
        <p
          className={
            "inline-flex items-center gap-1.5 text-[13px] font-bold " +
            (missing.length === 0 ? "text-emerald-700" : "text-amber-800")
          }
        >
          {missing.length === 0 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> 넣을 페이지 4개가 모두 준비됐어요
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" /> 아직 준비 안 된 페이지가 {missing.length}개 있어요
            </>
          )}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-neutral-600">
          링크는 넣을 페이지가 있어야 만들 수 있습니다. 비어 있는 건 그 숙제로 돌아가 먼저 만드세요.
        </p>

        {missing.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {missing.map((s) => {
              const src = SOURCE[s.key];
              const href = src ? taskHref(src.guideKey) : null;
              const body = (
                <>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-neutral-400">{s.n}번 버튼</span>
                    <span className="block truncate text-[13px] font-bold text-neutral-900">
                      {src?.label ?? s.label}
                    </span>
                  </span>
                  {href && <ArrowRight className="w-4 h-4 shrink-0 text-neutral-400" />}
                </>
              );
              return href ? (
                <a
                  key={s.key}
                  href={href}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 hover:border-amber-400"
                >
                  {body}
                </a>
              ) : (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5"
                >
                  {body}
                </div>
              );
            })}
          </div>
        )}

        {prefillCount > 0 && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2">
            <p className="text-[12px] leading-5 text-indigo-900/80">
              {autoFilled
                ? "앞 숙제에서 만든 페이지 주소를 자동으로 넣어뒀어요."
                : "앞 숙제에서 만든 페이지 주소를 빈 칸에 넣을 수 있어요."}
            </p>
            <PrefillButton label="다시 채우기" onClick={applyPrefill} />
          </div>
        )}
      </div>

      <a
        href="https://youtu.be/qYQd7ea3_oU"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 hover:border-pink-400"
      >
        <span className="shrink-0 w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center">
          <Youtube className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">인포크 링크 만드는 법 (영상)</p>
          <p className="text-xs text-neutral-500 truncate">먼저 이 영상을 보고 링크인바이오를 만드세요</p>
        </div>
        <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
      </a>

      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">반드시 이 순서로 버튼을 배치하세요</p>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-6 h-6 rounded-lg ig-gradient text-white text-xs font-black flex items-center justify-center">
                  {s.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900">{s.label}</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">{s.tip}</p>
                  <div className="mt-2">
                    <label className={FLABEL}>연결할 링크</label>
                    <input
                      value={data[s.key] ?? ""}
                      onChange={(e) => set(s.key, e.target.value)}
                      className={FIELD}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} />

      {show && (
        <FeedbackBox>
          <p className="text-[13px] text-neutral-800 mb-1.5">
            버튼 링크 <strong>{filled}/4</strong> 채움. 순서는 <strong>무료·이벤트 → 후기 → 상품/FAQ → 상담</strong>이 맞아요.
          </p>
          <ul className="text-[12px] text-neutral-600 space-y-1 list-disc pl-4">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </FeedbackBox>
      )}
    </div>
  );
}
