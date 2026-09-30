"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheck, Sprout, ShoppingBag, Store, Scissors, GraduationCap, Stethoscope,
  Shapes, UserRound, Link2, Play, CirclePlus, Moon, TrendingDown, TrendingUp,
  MessageSquareText, Users, Repeat, ArrowLeft, ArrowRight, Check, Loader2, type LucideIcon,
} from "lucide-react";
import {
  PRODUCT_CHOICES, STAGE_CHOICES, GOAL_CHOICES, trackChoices, buildPlan,
  PRODUCT_NOTE_COPY, PRODUCT_NOTE_MAX,
  type OnboardingAnswers, type Choice, type HasProduct, type TrackId,
  type AccountStage, type Goal,
} from "@/lib/challenge-onboarding";

const ICONS: Record<string, LucideIcon> = {
  PackageCheck, Sprout, ShoppingBag, Store, Scissors, GraduationCap, Stethoscope,
  Shapes, UserRound, Link2, Play, CirclePlus, Moon, TrendingDown, TrendingUp,
  MessageSquareText, Users, Repeat,
};

/** 배지 색. 카드 자체는 흰색으로 두고 아이콘 배지에만 색을 쓴다 — 6장이 나란히 놓여도 안 시끄럽게. */
const TONES: Record<Choice<string>["tone"], string> = {
  pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
  violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
  neutral: "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white",
};

// 상품 유무 → 업종/방향 → 무엇을 파는지 → 계정 상태 → 목표
const TOTAL = 5;

export function OnboardingWizard({
  cohortName,
  nextHref,
  preview = false,
  saveUrl,
  initialAnswers,
}: {
  cohortName: string;
  nextHref: string;
  preview?: boolean;
  /** 답을 저장할 API. 미리보기에서는 없다. */
  saveUrl?: string;
  /** 다시 고르러 들어온 경우 이전 답 */
  initialAnswers?: OnboardingAnswers;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers ?? {});
  const [step, setStep] = useState(1); // 1~5, 6 = 결과
  const [leaving, setLeaving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const plan = buildPlan(answers);

  /** 카드를 누르면 잠깐 체크가 보이고 다음으로 넘어간다. 다음 버튼을 따로 두지 않는다. */
  function pick(key: keyof OnboardingAnswers, value: string) {
    setLeaving(value);
    setTimeout(() => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        // 상품 유무를 바꾸면 그 아래 선택은 무효가 된다
        // 상품 유무를 바꾸면 그 아래 선택(업종·무엇을 파는지)은 무효가 된다
        if (key === "hasProduct" && prev.hasProduct !== value) {
          delete next.track;
          delete next.productNote;
        }
        if (key === "track" && prev.track !== value) delete next.productNote;
        return next;
      });
      setStep((s) => s + 1);
      setLeaving(null);
      window.scrollTo({ top: 0 });
    }, 180);
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0 });
  }

  const pct = step > TOTAL ? 100 : ((step - 1) / TOTAL) * 100;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes obRise { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        .ob-rise { animation: obRise .34s cubic-bezier(.22,.9,.3,1) both }
      `}</style>

      {/* 진행 막대 — 화면 맨 위에 얇게. 몇 개 남았는지가 이탈을 막는다 */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-neutral-100">
        <div
          className="h-full ig-gradient transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <main className="px-5 pb-24 pt-14 sm:pt-20">
        <div className="mx-auto w-full max-w-[640px]">
          {/* 상단 바 */}
          <div className="flex items-center justify-between h-9">
            {step > 1 && step <= TOTAL ? (
              <button
                onClick={back}
                className="flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-lg text-[13px] font-semibold text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 이전
              </button>
            ) : (
              <span className="text-[11px] font-bold tracking-[1.5px] text-neutral-300 uppercase">
                {cohortName}
              </span>
            )}
            {step <= TOTAL && (
              <span className="text-[12px] font-bold tabular-nums text-neutral-300">
                {step} <span className="text-neutral-200">/ {TOTAL}</span>
              </span>
            )}
          </div>

          {/* 지금까지 고른 것 — 좁혀지고 있다는 걸 눈으로 보여준다 */}
          <Trail answers={answers} step={step} />

          {step <= TOTAL ? (
            <div key={step} className="ob-rise">
              {step === 1 && (
                <Question
                  eyebrow="시작하기 전에"
                  title={<>지금 팔고 있는 게<br />있으신가요?</>}
                  sub="여기서부터 5주가 완전히 달라집니다. 없다고 해서 못 하는 건 아닙니다."
                >
                  <Cards
                    items={PRODUCT_CHOICES}
                    selected={answers.hasProduct}
                    leaving={leaving}
                    onPick={(v) => pick("hasProduct", v as HasProduct)}
                    big
                  />
                </Question>
              )}

              {step === 2 && answers.hasProduct && (
                <Question
                  eyebrow={answers.hasProduct === "yes" ? "업종" : "방향"}
                  title={
                    answers.hasProduct === "yes" ? (
                      <>어느 쪽에<br />가장 가까우신가요?</>
                    ) : (
                      <>어디서<br />시작해 볼까요?</>
                    )
                  }
                  sub={
                    answers.hasProduct === "yes"
                      ? "정확히 안 맞아도 됩니다. 가장 비슷한 걸 고르시면 됩니다."
                      : "셋 다 상품 없이 시작할 수 있습니다. 지금 끌리는 걸로 고르세요. 나중에 바꿔도 됩니다."
                  }
                >
                  <Cards
                    items={trackChoices(answers.hasProduct)}
                    selected={answers.track}
                    leaving={leaving}
                    onPick={(v) => pick("track", v as TrackId)}
                  />
                </Question>
              )}

              {step === 3 && answers.track && (
                <ProductNoteStep
                  copy={PRODUCT_NOTE_COPY[answers.track]}
                  value={answers.productNote ?? ""}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, productNote: v }))}
                  onNext={() => {
                    setStep(4);
                    window.scrollTo({ top: 0 });
                  }}
                />
              )}

              {step === 4 && (
                <Question
                  eyebrow="현재 상태"
                  title={<>지금 인스타 계정은<br />어떤 상태인가요?</>}
                  sub="솔직하게 고르실수록 1주차에 버리는 시간이 줄어듭니다."
                >
                  <Cards
                    items={STAGE_CHOICES}
                    selected={answers.stage}
                    leaving={leaving}
                    onPick={(v) => pick("stage", v as AccountStage)}
                  />
                </Question>
              )}

              {step === 5 && (
                <Question
                  eyebrow="마지막"
                  title={<>5주 뒤,<br />딱 하나만 된다면?</>}
                  sub="다 하려다 아무것도 안 되는 게 제일 흔한 실패입니다. 하나만 고르세요."
                >
                  <Cards
                    items={GOAL_CHOICES}
                    selected={answers.goal}
                    leaving={leaving}
                    onPick={(v) => pick("goal", v as Goal)}
                  />
                </Question>
              )}
            </div>
          ) : (
            plan && (
              <div className="ob-rise">
                <Result
                  plan={plan}
                  nextHref={nextHref}
                  onRedo={() => {
                    setAnswers({});
                    setStep(1);
                    setSaveError(null);
                  }}
                  preview={preview}
                  saving={saving}
                  error={saveError}
                  onStart={
                    saveUrl
                      ? async () => {
                          setSaving(true);
                          setSaveError(null);
                          try {
                            const res = await fetch(saveUrl, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(answers),
                            });
                            if (!res.ok) {
                              const j = await res.json().catch(() => ({}));
                              setSaveError(j.error ?? "저장하지 못했어요. 다시 눌러주세요.");
                              return;
                            }
                            router.push(nextHref);
                            router.refresh();
                          } catch {
                            setSaveError("저장하지 못했어요. 연결을 확인하고 다시 눌러주세요.");
                          } finally {
                            setSaving(false);
                          }
                        }
                      : undefined
                  }
                />
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

/* ── 조각들 ───────────────────────────────────────────────── */

function Question({
  eyebrow, title, sub, children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <p className="mt-8 text-[11px] font-bold tracking-[2px] text-pink-600 uppercase">{eyebrow}</p>
      <h1 className="mt-3 text-[30px] sm:text-[38px] font-black leading-[1.28] tracking-[-0.022em] text-neutral-900 [word-break:keep-all]">
        {title}
      </h1>
      <p className="mt-4 text-[15px] leading-[1.75] text-neutral-500 [word-break:keep-all]">{sub}</p>
      <div className="mt-9 space-y-2.5">{children}</div>
    </>
  );
}

/**
 * 무엇을 파는지(다루는지) 한 줄. 카드 선택과 달리 자유입력이라 "다음"이 필요하다.
 * 트랙에 따라 묻는 말이 달라지고, 아직 정해진 게 없는 트랙은 건너뛸 수 있다.
 */
function ProductNoteStep({
  copy,
  value,
  onChange,
  onNext,
}: {
  copy: { title: string; desc: string; placeholder: string; optional?: boolean };
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const filled = value.trim().length > 0;
  return (
    <>
      <p className="mt-8 text-[11px] font-bold tracking-[2px] text-pink-600 uppercase">
        무엇을 파는지
      </p>
      <h1 className="mt-3 text-[30px] sm:text-[38px] font-black leading-[1.28] tracking-[-0.022em] text-neutral-900 [word-break:keep-all]">
        {copy.title}
      </h1>
      <p className="mt-4 text-[15px] leading-[1.75] text-neutral-500 [word-break:keep-all]">
        {copy.desc}
      </p>

      <div className="mt-9">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, PRODUCT_NOTE_MAX))}
          rows={3}
          autoFocus
          placeholder={copy.placeholder}
          className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-[15px] leading-[1.7] text-neutral-900 placeholder:text-neutral-300 focus:border-neutral-900 focus:outline-none resize-none"
        />
        <p className="mt-2 text-right text-[11.5px] tabular-nums text-neutral-300">
          {value.length} / {PRODUCT_NOTE_MAX}
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        <button
          onClick={onNext}
          disabled={!filled && !copy.optional}
          className="flex items-center justify-center gap-2 w-full rounded-2xl ig-gradient px-6 py-4 text-[16px] font-bold text-white hover:brightness-105 transition disabled:opacity-30"
        >
          다음 <ArrowRight className="w-4 h-4" />
        </button>
        {copy.optional && !filled && (
          <button
            onClick={onNext}
            className="w-full rounded-2xl border border-neutral-200 px-6 py-3.5 text-[14px] font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition"
          >
            아직 모르겠어요 · 건너뛰기
          </button>
        )}
      </div>
      <p className="mt-4 text-[12.5px] leading-[1.7] text-neutral-400 [word-break:keep-all]">
        여기 쓴 내용은 1주차 숙제 첫 칸에 그대로 채워집니다.
      </p>
    </>
  );
}

function Cards<T extends string>({
  items, selected, leaving, onPick, big = false,
}: {
  items: Choice<T>[];
  selected?: string;
  leaving: string | null;
  onPick: (v: T) => void;
  big?: boolean;
}) {
  return (
    <>
      {items.map((c) => {
        const Icon = ICONS[c.icon] ?? Shapes;
        const active = leaving === c.id || (!leaving && selected === c.id);
        return (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            className={[
              "group relative w-full text-left flex items-start gap-4 rounded-2xl border bg-white transition-all duration-200",
              big ? "px-5 py-5" : "px-5 py-4",
              active
                ? "border-neutral-900 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
                : "border-neutral-200 hover:border-neutral-900 hover:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.28)] hover:-translate-y-px",
            ].join(" ")}
          >
            <span
              className={[
                "shrink-0 flex items-center justify-center rounded-xl transition-colors duration-200",
                big ? "w-12 h-12" : "w-11 h-11",
                active ? "bg-neutral-900 text-white" : TONES[c.tone],
              ].join(" ")}
            >
              {active ? <Check className="w-5 h-5" strokeWidth={2.75} /> : <Icon className="w-5 h-5" strokeWidth={2} />}
            </span>
            <span className="flex-1 min-w-0 pt-0.5">
              <span className={["block font-bold tracking-[-0.01em] text-neutral-900", big ? "text-[17px]" : "text-[16px]"].join(" ")}>
                {c.title}
              </span>
              <span className="mt-1 block text-[13.5px] leading-[1.65] text-neutral-500 [word-break:keep-all]">
                {c.desc}
              </span>
            </span>
            <ArrowRight className="mt-3.5 w-4 h-4 shrink-0 text-neutral-200 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition" />
          </button>
        );
      })}
    </>
  );
}

/** 고른 답을 작은 칩으로 남긴다. 누르면 그 질문으로 되돌아간다. */
function Trail({ answers, step }: { answers: OnboardingAnswers; step: number }) {
  const chips: string[] = [];
  if (answers.hasProduct) chips.push(PRODUCT_CHOICES.find((c) => c.id === answers.hasProduct)!.id === "yes" ? "상품 있음" : "상품 없음");
  if (answers.track && answers.hasProduct)
    chips.push(trackChoices(answers.hasProduct).find((c) => c.id === answers.track)?.title ?? "");
  // 자유입력은 길 수 있어 앞부분만 칩으로 보여준다
  chips.push(
    answers.productNote?.trim()
      ? answers.productNote.trim().slice(0, 18) + (answers.productNote.trim().length > 18 ? "…" : "")
      : "아직 미정"
  );
  if (answers.stage) chips.push(STAGE_CHOICES.find((c) => c.id === answers.stage)!.title);
  if (answers.goal) chips.push(GOAL_CHOICES.find((c) => c.id === answers.goal)!.title);

  const visible = chips.slice(0, step - 1);
  if (!visible.length || step > TOTAL) return <div className="h-0" />;

  return (
    <div className="mt-5 flex flex-wrap gap-1.5">
      {visible.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] font-semibold text-neutral-500"
        >
          <Check className="w-3 h-3 text-neutral-400" strokeWidth={3} />
          {c}
        </span>
      ))}
    </div>
  );
}

function Result({
  plan, nextHref, onRedo, preview, onStart, saving, error,
}: {
  plan: NonNullable<ReturnType<typeof buildPlan>>;
  nextHref: string;
  onRedo: () => void;
  preview: boolean;
  /** 실제 저장 (미리보기에서는 없음 → 링크로만 이동) */
  onStart?: () => void;
  saving?: boolean;
  error?: string | null;
}) {
  return (
    <>
      <p className="mt-8 text-[11px] font-bold tracking-[2px] text-pink-600 uppercase">맞춤 커리큘럼</p>
      <h1 className="mt-3 text-[30px] sm:text-[38px] font-black leading-[1.28] tracking-[-0.022em] text-neutral-900 [word-break:keep-all]">
        {plan.trackLabel}으로<br />5주를 짰습니다
      </h1>

      {/* 진단 한 줄 — 잉크 블록 하나만. 여기가 이 화면의 무게중심이다 */}
      <div className="mt-7 rounded-3xl bg-neutral-950 px-6 py-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-white/40">지금 위치</p>
        <p className="mt-2.5 text-[19px] font-bold leading-[1.55] tracking-[-0.012em] [word-break:keep-all]">
          {plan.persona}
        </p>
        <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
          <p className="text-[14px] leading-[1.75] text-white/65 [word-break:keep-all]">{plan.stageNote}</p>
          <p className="text-[14px] leading-[1.75] text-white/65 [word-break:keep-all]">{plan.goalNote}</p>
        </div>
      </div>

      {/* 5주 */}
      <div className="mt-10">
        <h2 className="text-[13px] font-bold tracking-[1.5px] text-neutral-400 uppercase">5주 흐름</h2>
        <ol className="mt-4">
          {plan.weeks.map((w, i) => (
            <li key={w.index} className="relative flex gap-4 pb-7 last:pb-0">
              {i < plan.weeks.length - 1 && (
                <span className="absolute left-[15px] top-9 bottom-0 w-px bg-neutral-200" />
              )}
              <span className="relative z-10 shrink-0 w-8 h-8 rounded-full ig-gradient text-white text-[13px] font-black flex items-center justify-center">
                {w.index}
              </span>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[16px] font-bold tracking-[-0.01em] text-neutral-900">{w.title}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.75] text-neutral-500 [word-break:keep-all]">{w.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-11 space-y-2.5">
        {onStart ? (
          <button
            onClick={onStart}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full rounded-2xl ig-gradient px-6 py-4 text-[16px] font-bold text-white hover:brightness-105 transition disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> 저장 중…
              </>
            ) : (
              <>
                이대로 시작하기 <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <Link
            href={nextHref}
            className="flex items-center justify-center gap-2 w-full rounded-2xl ig-gradient px-6 py-4 text-[16px] font-bold text-white hover:brightness-105 transition"
          >
            이대로 시작하기 <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        <button
          onClick={onRedo}
          disabled={saving}
          className="w-full rounded-2xl border border-neutral-200 px-6 py-3.5 text-[14px] font-semibold text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition disabled:opacity-50"
        >
          다시 고를래요
        </button>
        {error && (
          <p className="pt-1 text-center text-[13px] font-semibold text-red-600">{error}</p>
        )}
      </div>

      {preview && (
        <p className="mt-6 text-center text-[12px] text-neutral-400">
          디자인 미리보기입니다. 선택 내용은 저장되지 않습니다.
        </p>
      )}
    </>
  );
}
