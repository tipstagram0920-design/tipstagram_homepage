"use client";

import { useState } from "react";
import { useGuideSave, FeedbackButton, FeedbackBox, CopyButton, FIELD, FLABEL } from "./common";

interface Data {
  who?: string;
  problem?: string;
  change?: string;
}

const IG_LIMIT = 150; // 인스타 바이오 최대 글자 수

const charLen = (s: string) => Array.from(s).length;

// 긴 입력을 핵심만 남겨 짧게 압축 (구분자 우선 → 단어 경계 클립)
function compress(input: string, maxLen: number): string {
  const t = input.trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (charLen(t) <= maxLen) return t;
  // 구분자(·, / | , 줄바꿈)로 나뉘면 앞에서부터 들어갈 만큼만
  const segs = t.split(/[·/|,\n]/).map((x) => x.trim()).filter(Boolean);
  if (segs.length > 1) {
    let out = "";
    for (const seg of segs) {
      const cand = out ? `${out} · ${seg}` : seg;
      if (charLen(cand) > maxLen) break;
      out = cand;
    }
    if (out) return out;
  }
  // 한 덩어리면 단어 경계에서 자르기
  const arr = Array.from(t);
  const clipped = arr.slice(0, maxLen).join("");
  const lastSpace = clipped.lastIndexOf(" ");
  return lastSpace > maxLen * 0.6 ? clipped.slice(0, lastSpace) : clipped;
}

function buildVersions(who: string, problem: string, change: string) {
  // 라인별 글자 예산 (짧게 유지)
  const w = compress(who, 22) || "○○ 전문가";
  const p = compress(problem, 14) || "○○ 고민";
  const c = compress(change, 16) || "○○한 변화";
  return [
    { name: "① 전문가형", lines: [w, `${p} 해결 꿀팁 매일`, `팔로우 → ${c}`] },
    { name: "② 공감형", lines: [`${w} | ${p} 해결사`, "진짜 되는 정보만 공유", `함께하면 ${c} ✨`] },
    { name: "③ 혜택형", lines: [w, `📌 ${p} 정보 매일`, `👇 팔로우하고 ${c}`] },
  ];
}

export function ProfileBioGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [who, setWho] = useState(initialData?.who ?? "");
  const [problem, setProblem] = useState(initialData?.problem ?? "");
  const [change, setChange] = useState(initialData?.change ?? "");
  const { saving, saved, save } = useGuideSave(taskId);
  const hasPrior = Boolean(initialData?.who || initialData?.problem || initialData?.change);
  const [show, setShow] = useState(hasPrior);
  const versions = buildVersions(who, problem, change);

  const getFeedback = () => {
    save({ who, problem, change });
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 leading-relaxed">
        길게 써도 괜찮아요 — <strong>핵심만 압축</strong>해서 짧은 3줄 바이오로 만들어 드려요. (인스타 바이오는 최대 <strong>{IG_LIMIT}자</strong>)
      </p>

      <div>
        <label className={FLABEL}>1) 나의 전문성 · 경력 · 수상 <span className="text-neutral-400 font-normal">(내가 누구인지)</span></label>
        <input value={who} onChange={(e) => setWho(e.target.value)} className={FIELD} placeholder="예: 필라테스 강사 8년차, L2 지도자 자격, 자세교정 후기 300건" />
      </div>
      <div>
        <label className={FLABEL}>2) 소비자의 문제 · 궁금점 <span className="text-neutral-400 font-normal">(꿀팁 줄 주제)</span></label>
        <input value={problem} onChange={(e) => setProblem(e.target.value)} className={FIELD} placeholder="예: 거북목·라운드숄더" />
      </div>
      <div>
        <label className={FLABEL}>3) 팔로우·상품 사용 시 얻을 변화</label>
        <input value={change} onChange={(e) => setChange(e.target.value)} className={FIELD} placeholder="예: 통증 없는 바른 자세" />
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} />

      {show && (
        <FeedbackBox>
          <p className="text-[12px] text-neutral-600 mb-3">
            핵심만 압축한 <strong>짧은 3줄 바이오 3버전</strong>이에요. 글자 수(<span className="text-neutral-500">{IG_LIMIT}자 이내</span>)를 확인하고 복사하세요.
          </p>
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
                  {over && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      {IG_LIMIT}자를 넘어요. 입력을 더 짧은 키워드로 줄여 보세요.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </FeedbackBox>
      )}
    </div>
  );
}
