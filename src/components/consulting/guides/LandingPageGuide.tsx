"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  FeedbackButton,
  FeedbackBox,
  CopyButton,
  PrefillButton,
  StepHeader,
  FIELD,
  FIELD_TA,
  FLABEL,
} from "./common";
import { Loader2, Sparkles, Wand2, Check, Link2, ArrowRight } from "lucide-react";
import { landingCopyToText } from "@/lib/consulting-guide-data";
import type {
  GuideContext,
  LandingCopy,
  LandingKey as Key,
  LandingPageData,
} from "@/lib/consulting-guide-data";

type Data = LandingPageData;

const FIELDS: { key: Key; label: string; placeholder: string; heading: string }[] = [
  { key: "problem", label: "1) 소비자의 문제", placeholder: "고객이 겪는 구체적인 문제/불편", heading: "혹시 이런 고민 있으신가요?" },
  { key: "loss", label: "2) 그로 인한 손해", placeholder: "그 문제를 방치하면 잃게 되는 것(시간·돈·기회)", heading: "이대로 두면" },
  { key: "myStory", label: "3) 나도 겪었던 문제", placeholder: "나도 똑같이 겪었던 경험", heading: "저도 그랬습니다" },
  { key: "solution", label: "4) 내가 해결한 방법", placeholder: "어떻게 그 문제를 해결했는지", heading: "그래서 이렇게 해결했어요" },
  { key: "product", label: "5) 그래서 만든 상품", placeholder: "그 방법을 담은 상품/서비스 소개", heading: "그렇게 만든 것이 바로" },
  { key: "reviews", label: "6) 소비자 후기", placeholder: "실제 후기 1~3개", heading: "먼저 경험한 분들의 후기" },
  { key: "composition", label: "7) 상품의 구성", placeholder: "무엇이 포함되는지(모듈·회차·자료 등)", heading: "이렇게 구성돼 있어요" },
  { key: "faq", label: "8) 자주 묻는 질문", placeholder: "Q&A 2~4개", heading: "자주 묻는 질문" },
  { key: "bonusNow", label: "9) 지금만 얻는 혜택", placeholder: "지금 결정하면 주는 한정 혜택", heading: "지금 시작하면 이런 혜택이" },
  { key: "addedValue", label: "10) 더해지는 상품 가치", placeholder: "추가로 얹어지는 가치·보너스", heading: "여기에 더해지는 가치" },
  { key: "cta", label: "11) 구매 CTA", placeholder: "행동을 유도하는 마지막 문장", heading: "" },
];

export function assembleLanding(d: Record<string, string>): string {
  return assemble(d as Data);
}

function assemble(d: Data): string {
  const parts: string[] = [];
  for (const f of FIELDS) {
    const v = (d[f.key] || "").trim();
    if (!v) continue;
    if (f.key === "cta") {
      parts.push(`👉 ${v}`);
    } else {
      parts.push(`【 ${f.heading} 】\n${v}`);
    }
  }
  return parts.join("\n\n");
}

/**
 * 앞 숙제(소비자 선정 · 나의 스토리)의 답으로 랜딩 항목을 미리 채운다.
 * 이미 쓴 칸은 절대 덮어쓰지 않는다.
 */
function buildPrefill(ctx: GuideContext | null | undefined): Partial<Record<Key, string>> {
  const c = ctx?.customer ?? null;
  const s = ctx?.story ?? null;
  if (!c && !s) return {};

  const problems = (c?.problems ?? []).map((p) => (p ?? "").trim()).filter(Boolean);
  const out: Partial<Record<Key, string>> = {};

  if (problems.length) {
    out.problem =
      problems.length > 1
        ? `${problems[0]}\n\n그리고 이런 것들도 함께 겪고 계실 거예요.\n${problems
            .slice(1)
            .map((p) => `· ${p}`)
            .join("\n")}`
        : problems[0];
  }
  const myProblem = (c?.myProblem || s?.origin || "").trim();
  if (myProblem) out.myStory = myProblem;

  const turning = (c?.myTurning || s?.turningPoint || "").trim();
  const howSolved = (s?.howSolved || "").trim();
  const solution = [turning, howSolved].filter(Boolean).join("\n\n");
  if (solution) out.solution = solution;

  const change = (c?.change || "").trim();
  const proof = (c?.myProof || s?.expertise || "").trim();
  if (change || proof) {
    out.product = [
      change ? `${change} — 이걸 만들기 위한 것입니다.` : "",
      proof ? `(근거: ${proof})` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return out;
}

function isEmptyData(d: Data | null): boolean {
  if (!d) return true;
  return !FIELDS.some((f) => (d[f.key] || "").trim());
}

export function LandingPageGuide({
  taskId,
  initialData,
  context,
  next,
}: {
  taskId: string;
  initialData: Data | null;
  context?: GuideContext | null;
  next?: { id: string; title: string; day: number } | null;
}) {
  const [data, setData] = useState<Data>(initialData ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, data);

  const prefill = useMemo(() => buildPrefill(context), [context]);
  const hasPrefill = Object.keys(prefill).length > 0;

  // 아직 아무것도 안 쓴 상태로 처음 들어왔다면 앞 숙제 값으로 한 번 채워준다.
  const [autoFilled, setAutoFilled] = useState(false);
  const didAutoFill = useRef(false);
  useEffect(() => {
    if (didAutoFill.current) return;
    if (!hasPrefill || initialData?.prefilled || !isEmptyData(initialData)) return;
    didAutoFill.current = true;
    setData((prev) => ({ ...prev, ...prefill, prefilled: true }));
    setAutoFilled(true);
  }, [hasPrefill, prefill, initialData]);

  const applyPrefill = () =>
    setData((prev) => {
      const merged: Data = { ...prev, prefilled: true };
      for (const [k, v] of Object.entries(prefill)) {
        if (!(merged[k as Key] || "").trim()) merged[k as Key] = v;
      }
      return merged;
    });

  const [copy, setCopy] = useState<LandingCopy | null>(initialData?.copy ?? null);
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [show, setShow] = useState(Boolean(initialData?.copy) || !isEmptyData(initialData));

  const set = (k: Key, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const fallbackText = assemble(data);
  const filledCount = FIELDS.filter((f) => (data[f.key] || "").trim()).length;

  // 확정 프로필 3줄 — 같은 목소리로 쓰라고 위에 띄워둔다
  const profileLines = (context?.customer?.finalLines ?? [])
    .map((l) => (l ?? "").trim())
    .filter(Boolean);

  const generate = async () => {
    save(data);
    setShow(true);
    setGenerating(true);
    setFailed(false);
    try {
      const fields: Record<string, string> = {};
      for (const f of FIELDS) fields[f.key] = data[f.key] ?? "";
      const res = await fetch("/api/consulting/landing-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, fields }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.copy) {
        const c = json.copy as LandingCopy;
        setCopy(c);
        // 생성된 글도 함께 저장해 다시 들어와도 그대로 보이게 한다
        const nextData: Data = { ...data, copy: c };
        setData(nextData);
        save(nextData);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setGenerating(false);
    }
  };

  const finalText = copy ? landingCopyToText(copy) : fallbackText;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-neutral-500 leading-5 flex-1">
          앞 숙제에 쓴 <strong>내 이야기·소비자 문제</strong>로 아래 칸이 미리 채워집니다. 다듬고 버튼을 누르면
          <strong> 상담·주문 페이지 글이 완성</strong>돼요.
        </p>
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {/* 앞 숙제에서 확정한 프로필 — 같은 목소리 유지용 */}
      {profileLines.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
          <p className="text-[12px] font-bold text-emerald-700 mb-1.5">
            앞 숙제에서 확정한 내 프로필
          </p>
          <div className="space-y-0.5 text-[13px] leading-6 text-emerald-900/85">
            {profileLines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] text-emerald-900/60">
            이 페이지도 같은 목소리로 씁니다. 프로필과 말이 달라지면 안 팔려요.
          </p>
        </div>
      )}

      {/* 미리 채우기 안내 */}
      {hasPrefill && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5">
          <p className="text-[12px] leading-5 text-indigo-900/80">
            {autoFilled ? (
              <>
                <strong>앞 숙제 내용으로 미리 채웠어요.</strong> 그대로 두지 말고 내 말투로 다듬어 주세요.
              </>
            ) : (
              <>앞 숙제(소비자 선정 · 나의 스토리)에 쓴 답을 빈 칸에 채워 넣을 수 있어요.</>
            )}
          </p>
          <PrefillButton label="다시 채우기" onClick={applyPrefill} />
        </div>
      )}

      <StepHeader
        n={1}
        title="항목 채우기"
        desc={`빈 칸은 건너뛰어도 됩니다. 없는 후기·숫자는 지어내지 마세요. (${filledCount}/${FIELDS.length})`}
        done={filledCount >= 5}
      />

      <div className="space-y-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className={FLABEL}>{f.label}</label>
            <textarea
              value={data[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              rows={f.key === "reviews" || f.key === "faq" || f.key === "composition" ? 3 : 2}
              className={FIELD_TA}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <StepHeader
        n={2}
        title="랜딩페이지 글 만들기"
        desc="채운 항목만 가지고 판매 순서대로 글을 씁니다."
        done={Boolean(copy)}
      />

      <FeedbackButton onClick={generate} saving={saving} saved={saved} label="랜딩페이지 글 만들기" />

      {show && (
        <FeedbackBox>
          {generating ? (
            <div className="flex items-center gap-2 py-6 justify-center text-[13px] font-semibold text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              입력하신 내용으로 페이지 글을 쓰는 중이에요… (20~30초쯤 걸려요)
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                  <Wand2 className="w-3.5 h-3.5" /> 완성된 랜딩페이지 글
                </p>
                {finalText && <CopyButton text={finalText} label="전체 복사" />}
              </div>

              {copy && (
                <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600">
                  <Sparkles className="w-3 h-3" /> 입력하신 내용을 실제로 읽고 쓴 글이에요
                </p>
              )}
              {failed && (
                <p className="text-[12px] text-amber-600 mb-2">
                  지금은 자동 작성이 안 돼서, 입력하신 내용을 순서대로 조립해 보여드려요. 잠시 뒤 다시 눌러보세요.
                </p>
              )}

              {copy ? (
                <div className="space-y-2.5">
                  <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
                    <p className="text-[16px] font-black leading-7 text-neutral-900">{copy.headline}</p>
                    {copy.subheadline && (
                      <p className="mt-1 text-[13px] leading-6 text-neutral-500">{copy.subheadline}</p>
                    )}
                  </div>
                  {copy.sections.map((s, i) => (
                    <div key={i} className="rounded-lg border border-neutral-200 bg-white p-3.5">
                      <p className="text-[13px] font-bold text-neutral-900">{s.heading}</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-neutral-700">
                        {s.body}
                      </p>
                    </div>
                  ))}
                  {copy.ctaLine && (
                    <div className="rounded-lg ig-gradient p-3.5 text-center">
                      <p className="text-[14px] font-black text-white">👉 {copy.ctaLine}</p>
                    </div>
                  )}
                  {copy.tips.length > 0 && (
                    <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                      <p className="text-[12px] font-bold text-pink-700 mb-1.5">더 팔리려면</p>
                      <ul className="list-disc space-y-1 pl-4 text-[12px] leading-5 text-pink-700/90">
                        {copy.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="inline-flex items-center gap-1 text-[11.5px] text-neutral-400">
                    <Check className="w-3 h-3" /> 이 글을 상담·주문 페이지에 붙여넣고, 사실이 다른 부분만 고치세요.
                  </p>
                </div>
              ) : fallbackText ? (
                <div className="rounded-lg border border-neutral-200 bg-white p-3 text-[13px] text-neutral-900 whitespace-pre-wrap leading-relaxed">
                  {fallbackText}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">위 항목을 채우면 여기에 글이 만들어져요.</p>
              )}
            </>
          )}
        </FeedbackBox>
      )}

      {/* 만든 페이지 주소 — 인포크 숙제 4번 버튼이 그대로 물어간다 */}
      <StepHeader
        n={3}
        title="만든 페이지 주소 넣기"
        desc="이 주소가 인포크 링크 숙제 4번 버튼(상담하기)에 자동으로 들어갑니다."
        done={Boolean((data.url ?? "").trim())}
      />

      <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
        <label className={FLABEL}>
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-neutral-400" /> 상담·주문 페이지 주소
          </span>
        </label>
        <p className="text-[12px] text-neutral-500 mb-1.5 leading-5">
          위 글을 붙여넣은 페이지(노션·블로그·스마트스토어 등)의 주소를 넣으세요.
        </p>
        <input
          type="url"
          value={data.url ?? ""}
          onChange={(e) => setData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://..."
          className={FIELD}
        />
      </div>

      {next && (
        <a
          href={`/consulting/${next.id}`}
          className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-3 hover:border-neutral-400"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-bold text-neutral-400">다음 숙제 · Day {next.day}</span>
            <span className="block truncate text-[13.5px] font-bold text-neutral-900">{next.title}</span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0 text-neutral-400" />
        </a>
      )}
    </div>
  );
}
