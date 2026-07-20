"use client";

import { useState } from "react";
import {
  useGuideSave,
  FeedbackButton,
  FeedbackBox,
  CopyButton,
  FIELD,
  FIELD_TA,
  FLABEL,
  charLen,
  compress,
} from "./common";
import { Search, Swords, Star } from "lucide-react";

interface Data {
  problems?: string[];
  change?: string;
  personaLine?: string;
  personaDetail?: string;
  expertise?: string;
}

const IG_LIMIT = 150;

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

export function buildProfiles(topProblem: string, change: string, persona: string, expertise: string) {
  const p = compress(topProblem, 14) || "○○ 고민";
  const c = compress(change, 16) || "○○한 변화";
  const who = compress(persona, 16) || "○○";
  const exp = compress(expertise, 22);
  return [
    { name: "① 타겟 지목형", lines: [`${who}을 위한 계정`, `${p} 해결 꿀팁 매일`, `팔로우 → ${c}`] },
    { name: "② 공감형", lines: [`${p}, 저도 그랬어요`, `${who} 위한 진짜 정보만`, `함께하면 ${c} ✨`] },
    {
      name: "③ 전문가형",
      lines: [exp || `${who}의 ${p} 해결사`, `📌 ${p} 정보 매일`, `👇 팔로우하고 ${c}`],
    },
  ];
}

export function CustomerSelectGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [problems, setProblems] = useState<string[]>(
    initialData?.problems && initialData.problems.length === 5
      ? initialData.problems
      : ["", "", "", "", ""]
  );
  const [change, setChange] = useState(initialData?.change ?? "");
  const [personaLine, setPersonaLine] = useState(initialData?.personaLine ?? "");
  const [personaDetail, setPersonaDetail] = useState(initialData?.personaDetail ?? "");
  const [expertise, setExpertise] = useState(initialData?.expertise ?? "");
  const { saving, saved, save } = useGuideSave(taskId);
  const [show, setShow] = useState(Boolean(initialData?.problems?.some((p) => p.trim())));

  const setProblem = (i: number, v: string) =>
    setProblems((prev) => prev.map((p, idx) => (idx === i ? v : p)));

  const filledProblems = problems.filter((p) => p.trim());
  const topProblem = filledProblems[0] ?? "";
  const versions = buildProfiles(topProblem, change, personaLine, expertise);

  const getFeedback = () => {
    save({ problems, change, personaLine, personaDetail, expertise });
    setShow(true);
  };

  return (
    <div className="space-y-4">
      {/* 3가지 방법 */}
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">🔎 소비자를 선정하는 3가지 방법</p>
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
      </div>

      {/* 소비자 문제 5가지 */}
      <div>
        <label className={FLABEL}>소비자가 가진 문제 5가지 <span className="text-neutral-400 font-normal">(위 방법으로 찾아서)</span></label>
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
                placeholder={`문제 ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 변화 */}
      <div>
        <label className={FLABEL}>이 문제들을 해결하면 나타나는 변화</label>
        <input value={change} onChange={(e) => setChange(e.target.value)} className={FIELD} placeholder="예: 통증 없이 하루를 보내는 몸" />
      </div>

      {/* 페르소나 */}
      <div>
        <label className={FLABEL}>페르소나 — 타겟 한 줄</label>
        <input value={personaLine} onChange={(e) => setPersonaLine(e.target.value)} className={FIELD} placeholder="예: 30대 워킹맘 / 하루종일 앉아 일하는 직장인" />
      </div>
      <div>
        <label className={FLABEL}>페르소나 상세 <span className="text-neutral-400 font-normal">(선택 — 나이·직업·하루·핵심 고민)</span></label>
        <textarea value={personaDetail} onChange={(e) => setPersonaDetail(e.target.value)} rows={2} className={FIELD_TA} placeholder="그 사람의 하루와 고민을 생생하게" />
      </div>

      {/* 전문성 (선택) */}
      <div>
        <label className={FLABEL}>나의 전문성·경력 <span className="text-neutral-400 font-normal">(선택 — 프로필 신뢰도용)</span></label>
        <input value={expertise} onChange={(e) => setExpertise(e.target.value)} className={FIELD} placeholder="예: 필라테스 8년차 · 자세교정 후기 300건" />
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} label="프로필 추천 받기" />

      {show && (
        <FeedbackBox>
          <p className="text-[12px] text-neutral-600 mb-2">
            선정한 <strong>핵심 문제</strong> {filledProblems.length}개 · 타겟 <strong>{compress(personaLine, 16) || "미입력"}</strong> 기준으로 만든 프로필 추천 3버전이에요. (인스타 {IG_LIMIT}자 이내)
          </p>
          {filledProblems.length < 3 && (
            <p className="text-[12px] text-amber-600 mb-2">⚠️ 문제를 최소 3~5개 채우면 훨씬 정확한 추천이 나와요.</p>
          )}
          <div className="space-y-3">
            {versions.map((v) => {
              const text = v.lines.join("\n");
              const len = charLen(text);
              const over = len > IG_LIMIT;
              return (
                <div key={v.name} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="inline-flex items-center gap-2">
                      <p className="text-xs font-bold text-neutral-700">{v.name}</p>
                      <span
                        className={
                          "text-[10px] font-bold rounded-full px-1.5 py-0.5 " +
                          (over ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700")
                        }
                      >
                        {len}자{over ? " · 초과" : ""}
                      </span>
                    </div>
                    <CopyButton text={text} />
                  </div>
                  <div className="text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">{text}</div>
                </div>
              );
            })}
          </div>
        </FeedbackBox>
      )}
    </div>
  );
}
