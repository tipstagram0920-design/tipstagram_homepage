"use client";

import { useMemo, useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  FeedbackButton,
  FeedbackBox,
  CopyButton,
  StepHeader,
  PrefillButton,
  NextTaskBox,
  FIELD,
  FIELD_TA,
  FLABEL,
  charLen,
  compress,
} from "./common";
import { Search, Swords, Star, Loader2, Sparkles, Check, PenLine } from "lucide-react";
import type { ProfileSuggestion as Suggestion } from "@/lib/consulting-profile-ai";
import type { CustomerSelectData, GuideContext } from "@/lib/consulting-guide-data";

type Data = CustomerSelectData;

const IG_LIMIT = 150;

/** 프로필 3줄이 각각 맡는 역할 (결과 화면 라벨) */
const LINE_ROLE = ["전문가", "누구에게", "변화"];

const METHODS = [
  {
    icon: Search,
    title: "1. SNS·블로그 인기 글/영상에서 찾기",
    tip: "내 주제로 검색해 가장 인기 많은 글·릴스·영상을 보고, 사람들이 무엇을 궁금해하고 힘들어하는지 캡처하세요.",
  },
  {
    icon: Swords,
    title: "2. 경쟁자 상품 페이지에서 찾기",
    tip: "경쟁 상품의 상세 페이지가 '어떤 문제'를 겨냥하는지 보세요. 그들이 파는 문제 = 검증된 소비자 문제.",
  },
  {
    icon: Star,
    title: "3. 리뷰에서 찾기",
    tip: "경쟁 상품·유사 서비스의 후기(특히 별점 낮은 것)에서 소비자가 진짜 겪은 불편을 그대로 뽑으세요.",
  },
];

/** ① 참여자 본인의 이야기 — 프로필 1줄·3줄의 재료 */
const MY_FIELDS: {
  key: "myProblem" | "myTurning" | "myProof" | "whyThem";
  label: string;
  help: string;
  placeholder: string;
  rows: number;
  optional?: boolean;
}[] = [
  {
    key: "myProblem",
    label: "나도 똑같이 겪었던 문제는 무엇인가요?",
    help: "내가 겪은 문제가 곧 소비자의 문제입니다. 그때 하루가 어땠는지 그대로 적어주세요.",
    placeholder:
      "예: 3년간 허리가 아파서 30분도 앉아 있질 못했어요. 병원은 그때뿐이고, 일에 집중이 안 되는 게 제일 힘들었습니다.",
    rows: 3,
  },
  {
    key: "myTurning",
    label: "그 문제를 넘게 해준 결정적인 한 가지는요?",
    help: "여러 가지를 시도했겠지만, 실제로 판을 바꾼 하나만 적으세요. 프로필 3줄의 '변화'가 여기서 나옵니다.",
    placeholder:
      "예: 운동 강도가 아니라 하루 중 앉아 있는 자세를 바꾼 것이었어요. 그걸 알기 전엔 아무리 운동해도 제자리였습니다.",
    rows: 3,
  },
  {
    key: "myProof",
    label: "내가 이 말을 할 수 있는 근거는 무엇인가요?",
    help: "경력·자격·기간·인원·후기 수 등 숫자가 있으면 그대로. 프로필 첫 줄에 들어갑니다. 없는 숫자를 지어내지는 마세요.",
    placeholder: "예: 필라테스 8년차 · 자세교정 300명 · 후기 210건",
    rows: 2,
  },
  {
    key: "whyThem",
    label: "왜 하필 이 사람들을 돕고 싶은가요?",
    help: "예전의 나와 닮은 사람일수록 좋습니다. 이 답이 콘텐츠의 말투를 정합니다.",
    placeholder: "예: 하루 종일 앉아 일하면서 '나이 탓'이라고 넘기는 30~40대. 예전의 저랑 똑같아서요.",
    rows: 2,
    optional: true,
  },
];

export function buildProfiles(topProblem: string, change: string, persona: string, expertise: string) {
  const p = compress(topProblem, 14) || "○○ 고민";
  const c = compress(change, 16) || "○○한 변화";
  const who = compress(persona, 16) || "○○";
  const exp = compress(expertise, 22);
  // 3줄 구조: [내가 어떤 전문가인지] → [누구에게 어떤 가치] → [팔로우 후의 변화]
  // AI 호출이 실패했을 때만 쓰는 폴백이라 문장만 겨우 되게 맞춰둔다.
  return [
    {
      name: "① 전문가 신뢰형",
      lines: [
        exp || `${p}를 다루는 사람`,
        `${who}의 ${p}을 해결합니다`,
        `${c}을 만들어 드려요`,
      ],
    },
    {
      name: "② 문제 공감형",
      lines: [
        `저도 ${p}으로 오래 고생했어요`,
        `${who}에게 필요한 것만 알려드려요`,
        `${c}에 한 걸음씩 가까워집니다`,
      ],
    },
    {
      name: "③ 변화 약속형",
      lines: [
        `${c}을 만드는 곳`,
        `${who}의 ${p}부터 함께 풉니다`,
        exp ? `${exp}가 도와드려요` : `오늘부터 달라집니다`,
      ],
    },
  ];
}

export function CustomerSelectGuide({
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
  // ① 내 이야기
  const [my, setMy] = useState({
    myProblem: initialData?.myProblem ?? "",
    myTurning: initialData?.myTurning ?? "",
    myProof: initialData?.myProof ?? "",
    whyThem: initialData?.whyThem ?? "",
  });
  // ② 소비자
  const [problems, setProblems] = useState<string[]>(
    initialData?.problems && initialData.problems.length === 5
      ? initialData.problems
      : ["", "", "", "", ""]
  );
  const [change, setChange] = useState(initialData?.change ?? "");
  const [personaLine, setPersonaLine] = useState(initialData?.personaLine ?? "");
  const [personaDetail, setPersonaDetail] = useState(initialData?.personaDetail ?? "");
  const [expertise, setExpertise] = useState(initialData?.expertise ?? "");
  // ③ 확정 프로필
  const [chosenName, setChosenName] = useState(initialData?.chosenName ?? "");
  const [finalLines, setFinalLines] = useState<string[]>(
    initialData?.finalLines?.length ? initialData.finalLines : []
  );

  const payload = {
    ...my,
    problems,
    change,
    personaLine,
    personaDetail,
    expertise,
    chosenName,
    finalLines,
  };

  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, payload);
  const [show, setShow] = useState(Boolean(initialData?.problems?.some((p) => p.trim())));

  const setProblem = (i: number, v: string) =>
    setProblems((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  const setMyField = (k: keyof typeof my, v: string) => setMy((prev) => ({ ...prev, [k]: v }));

  const filled = problems.filter((p) => p.trim());
  const topProblem = filled[0] ?? "";

  // 1번 숙제(나의 스토리)에서 끌어올 값이 있는지
  const story = context?.story ?? null;
  const storyPrefill = useMemo(() => {
    if (!story) return null;
    const proof = [story.expertise, story.numbers].filter((v) => (v ?? "").trim()).join(" · ");
    const v = {
      myProblem: (story.origin ?? "").trim(),
      myTurning: (story.turningPoint ?? "").trim(),
      myProof: proof,
      whyThem: "",
    };
    return v.myProblem || v.myTurning || v.myProof ? v : null;
  }, [story]);

  const myDone = MY_FIELDS.filter((f) => !f.optional && my[f.key].trim()).length;
  const myComplete = myDone === MY_FIELDS.filter((f) => !f.optional).length;
  const consumerComplete = filled.length >= 3 && Boolean(personaLine.trim());
  const profileConfirmed = finalLines.some((l) => (l ?? "").trim());

  // AI 추천 결과. 없으면(키 미설정·실패) 기존 템플릿으로 폴백한다.
  const [ai, setAi] = useState<Suggestion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);

  const fallbackVersions = buildProfiles(topProblem, change, personaLine, expertise || my.myProof).map(
    (v) => ({ ...v, angle: "", reason: "" })
  );
  const versions = ai?.versions ?? fallbackVersions;

  const getFeedback = async () => {
    save(payload);
    setShow(true);
    setGenerating(true);
    setAiFailed(false);
    try {
      const res = await fetch("/api/consulting/profile-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.suggestion) setAi(data.suggestion as Suggestion);
      else setAiFailed(true);
    } catch {
      setAiFailed(true);
    } finally {
      setGenerating(false);
    }
  };

  const choose = (name: string, lines: string[]) => {
    setChosenName(name);
    setFinalLines(lines.slice(0, 3));
    save({ ...payload, chosenName: name, finalLines: lines.slice(0, 3) });
  };

  const setFinalLine = (i: number, v: string) =>
    setFinalLines((prev) => {
      const arr = [...prev];
      arr[i] = v;
      return arr;
    });

  const finalText = finalLines.map((l) => (l ?? "").trim()).filter(Boolean).join("\n");
  const finalLen = charLen(finalText);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] leading-5 text-neutral-500 flex-1">
          <strong>내 이야기 → 소비자 → 프로필</strong> 순서로 채웁니다. 소비자 정보만으로는 프로필이 나오지 않아요.
        </p>
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {/* ───────────── STEP 1. 내 이야기 ───────────── */}
      <StepHeader
        n={1}
        title="내 이야기부터 씁니다"
        desc="프로필 첫 줄(전문가)과 셋째 줄(변화)은 여기서 나옵니다. 여길 비우면 추천이 뻔한 문장이 됩니다."
        done={myComplete}
      />

      {storyPrefill && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5">
          <p className="text-[12px] leading-5 text-indigo-900/80">
            1번 숙제 <strong>나의 스토리</strong>에 쓰신 답이 있어요. 그대로 가져와서 다듬으면 됩니다.
          </p>
          <PrefillButton
            label="가져오기"
            onClick={() =>
              setMy((prev) => ({
                myProblem: prev.myProblem.trim() || storyPrefill.myProblem,
                myTurning: prev.myTurning.trim() || storyPrefill.myTurning,
                myProof: prev.myProof.trim() || storyPrefill.myProof,
                whyThem: prev.whyThem,
              }))
            }
          />
        </div>
      )}

      <div className="space-y-3">
        {MY_FIELDS.map((f) => (
          <div key={f.key}>
            <label className={FLABEL}>
              {f.label}
              {f.optional && <span className="text-neutral-400 font-normal"> (선택)</span>}
            </label>
            <p className="text-[12px] text-neutral-500 mb-1.5 leading-5">{f.help}</p>
            <textarea
              value={my[f.key]}
              onChange={(e) => setMyField(f.key, e.target.value)}
              rows={f.rows}
              placeholder={f.placeholder}
              className={FIELD_TA}
            />
          </div>
        ))}
      </div>

      {/* ───────────── STEP 2. 소비자 문제 ───────────── */}
      <StepHeader
        n={2}
        title="소비자가 가진 문제 5가지"
        desc="내가 겪은 문제와 겹치는 것부터 적으세요. 이 5개가 나중에 릴스 5개의 주제가 됩니다."
        done={filled.length >= 3}
      />

      <div className="space-y-2">
        {METHODS.map((m) => (
          <div key={m.title} className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <span className="shrink-0 w-8 h-8 rounded-lg ig-gradient text-white flex items-center justify-center">
              <m.icon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900">{m.title}</p>
              <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">{m.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {problems.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="shrink-0 w-5 h-5 rounded-md bg-neutral-100 text-neutral-500 text-[11px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <input
              value={p}
              onChange={(e) => setProblem(i, e.target.value)}
              className={FIELD}
              placeholder={i === 0 ? "가장 크게 겪는 문제부터" : `문제 ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {/* ───────────── STEP 3. 변화 · 페르소나 ───────────── */}
      <StepHeader
        n={3}
        title="그래서 누가, 어떻게 달라지나요"
        desc="이 두 가지가 프로필 2·3줄이 됩니다."
        done={consumerComplete}
      />

      <div>
        <label className={FLABEL}>이 문제들을 해결하면 나타나는 변화</label>
        <input value={change} onChange={(e) => setChange(e.target.value)} className={FIELD} placeholder="예: 통증 없이 하루를 보내는 몸" />
      </div>

      <div>
        <label className={FLABEL}>페르소나 — 타겟 한 줄</label>
        <input value={personaLine} onChange={(e) => setPersonaLine(e.target.value)} className={FIELD} placeholder="예: 30대 워킹맘 / 하루종일 앉아 일하는 직장인" />
      </div>
      <div>
        <label className={FLABEL}>페르소나 상세 <span className="text-neutral-400 font-normal">(선택 — 나이·직업·하루·핵심 고민)</span></label>
        <textarea value={personaDetail} onChange={(e) => setPersonaDetail(e.target.value)} rows={2} className={FIELD_TA} placeholder="그 사람의 하루와 고민을 생생하게" />
      </div>
      <div>
        <label className={FLABEL}>나의 전문성·경력 <span className="text-neutral-400 font-normal">(선택 — 위 3번에 이미 썼다면 비워도 됩니다)</span></label>
        <input value={expertise} onChange={(e) => setExpertise(e.target.value)} className={FIELD} placeholder="예: 필라테스 8년차 · 자세교정 후기 300건" />
      </div>

      {/* ───────────── STEP 4. 프로필 추천 ───────────── */}
      <StepHeader
        n={4}
        title="프로필 추천 받고, 하나 확정하기"
        desc="추천 3개 중 하나를 고르면 그대로 다음 숙제로 넘어갑니다."
        done={profileConfirmed}
      />

      {!my.myProblem.trim() && !my.myTurning.trim() && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
          ⚠️ 1번(내 이야기)이 비어 있어요. 지금 눌러도 나오지만, 나만의 프로필은 안 나옵니다.
        </p>
      )}

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} label="프로필 추천 받기" />

      {show && (
        <FeedbackBox>
          {generating ? (
            <div className="flex items-center gap-2 py-6 justify-center text-[13px] font-semibold text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              내 이야기와 소비자 문제를 읽고 프로필을 쓰는 중이에요… (20초쯤 걸려요)
            </div>
          ) : (
            <>
              <p className="text-[12px] text-neutral-600 mb-2">
                <strong>내 이야기</strong> + 핵심 문제 {filled.length}개 · 타겟{" "}
                <strong>{compress(personaLine, 16) || "미입력"}</strong> 기준으로 만든 프로필 3버전이에요. (인스타 {IG_LIMIT}자 이내)
              </p>
              {ai && (
                <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600">
                  <Sparkles className="w-3 h-3" /> 입력하신 내용을 실제로 읽고 쓴 추천이에요
                </p>
              )}
              {aiFailed && (
                <p className="text-[12px] text-amber-600 mb-2">
                  지금은 자동 작성이 안 돼서 기본 양식으로 보여드려요. 잠시 뒤 다시 눌러보세요.
                </p>
              )}
              {filled.length < 3 && (
                <p className="text-[12px] text-amber-600 mb-2">⚠️ 문제를 최소 3~5개 채우면 훨씬 정확한 추천이 나와요.</p>
              )}
              <div className="space-y-3">
                {versions.map((v, i) => {
                  const text = v.lines.join("\n");
                  const len = charLen(text);
                  const over = len > IG_LIMIT;
                  const picked = chosenName === v.name;
                  return (
                    <div
                      key={`${v.name}-${i}`}
                      className={
                        "rounded-xl border p-3 " +
                        (picked ? "border-pink-400 bg-white ring-2 ring-pink-100" : "border-neutral-200 bg-white")
                      }
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="inline-flex items-center gap-2 min-w-0">
                          <p className="text-xs font-bold text-neutral-700 truncate">{v.name}</p>
                          <span
                            className={
                              "shrink-0 text-[10px] font-bold rounded-full px-1.5 py-0.5 " +
                              (over ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700")
                            }
                          >
                            {len}자{over ? " · 초과" : ""}
                          </span>
                        </div>
                        <CopyButton text={text} />
                      </div>
                      {v.angle && <p className="text-[11px] text-neutral-500 mb-2">{v.angle}</p>}
                      {/* 3줄의 역할을 옆에 붙여 "왜 이 순서인지"가 보이게 한다 */}
                      <div className="space-y-1">
                        {v.lines.map((line, li) => (
                          <div key={li} className="flex items-start gap-2">
                            <span className="shrink-0 mt-[3px] w-[52px] text-[10px] font-bold text-neutral-400">
                              {LINE_ROLE[li] ?? ""}
                            </span>
                            <span className="flex-1 text-sm text-neutral-900 leading-relaxed">{line}</span>
                          </div>
                        ))}
                      </div>
                      {v.reason && (
                        <p className="mt-2 border-t border-neutral-100 pt-2 text-[11px] leading-5 text-neutral-500">
                          {v.reason}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => choose(v.name, v.lines)}
                        className={
                          "mt-2.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold " +
                          (picked
                            ? "bg-pink-600 text-white"
                            : "border border-neutral-200 text-neutral-700 hover:border-pink-400 hover:text-pink-600")
                        }
                      >
                        {picked ? <Check className="w-3.5 h-3.5" /> : null}
                        {picked ? "이걸로 확정했어요" : "이 프로필로 정하기"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {ai && ai.tips.length > 0 && (
                <div className="mt-3 rounded-xl border border-pink-200 bg-pink-50 p-3">
                  <p className="text-[12px] font-bold text-pink-700 mb-1.5">더 좋아지려면</p>
                  <ul className="list-disc space-y-1 pl-4 text-[12px] leading-5 text-pink-700/90">
                    {ai.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </FeedbackBox>
      )}

      {/* 확정한 프로필 — 손으로 다듬어 최종본으로 */}
      {profileConfirmed && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700">
              <PenLine className="w-3.5 h-3.5" /> 확정한 프로필 {chosenName && `· ${chosenName}`}
            </p>
            <span
              className={
                "text-[10px] font-bold rounded-full px-1.5 py-0.5 " +
                (finalLen > IG_LIMIT ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700")
              }
            >
              {finalLen}자
            </span>
          </div>
          <p className="mb-2 text-[12px] leading-5 text-emerald-900/70">
            여기서 직접 고쳐도 됩니다. 이 3줄을 인스타 프로필 소개글에 그대로 넣으세요.
          </p>
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0 w-[52px] text-[10px] font-bold text-neutral-400">
                  {LINE_ROLE[i]}
                </span>
                <input
                  value={finalLines[i] ?? ""}
                  onChange={(e) => setFinalLine(i, e.target.value)}
                  className={FIELD + " bg-white"}
                  placeholder={`${LINE_ROLE[i]} 줄`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <CopyButton text={finalText} label="3줄 전체 복사" />
            <button
              type="button"
              onClick={() => save({ ...payload, chosenName, finalLines })}
              className="text-[12px] font-bold text-emerald-700 hover:underline"
            >
              저장
            </button>
          </div>
        </div>
      )}

      {/* 다음 숙제로 이어짐 */}
      <NextTaskBox
        title="이 숙제는 여기로 이어집니다"
        ready={profileConfirmed}
        next={next}
        items={[
          "확정한 프로필 3줄 → 인스타 프로필 소개글에 바로 붙여넣기",
          "소비자 문제 1번 → 다음 숙제의 무료자료 주제가 됩니다",
          "내 이야기(문제 → 넘은 방법) → 랜딩페이지 글이 자동으로 미리 채워집니다",
          "문제 5개 → 릴스 5개의 주제가 됩니다",
        ]}
      />
    </div>
  );
}
