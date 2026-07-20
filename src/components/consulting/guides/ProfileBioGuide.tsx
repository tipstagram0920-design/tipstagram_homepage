"use client";

import { useState } from "react";
import { useGuideSave, SaveButton, CopyButton, FIELD, FLABEL } from "./common";

interface Data {
  who?: string;
  problem?: string;
  change?: string;
}

// 3줄 바이오 3버전 생성 (전문성→라인1, 소비자 문제 꿀팁→라인2, 변화→라인3)
function buildVersions(who: string, problem: string, change: string): { name: string; lines: string[] }[] {
  const w = who.trim() || "○○ 전문가";
  const p = problem.trim() || "○○ 고민";
  const c = change.trim() || "○○한 변화";
  return [
    {
      name: "① 전문가 신뢰형",
      lines: [w, `${p}, 여기서 매일 해결법 공유`, `팔로우하면 → ${c}`],
    },
    {
      name: "② 공감·친근형",
      lines: [`${w} | 당신의 ${p} 해결사`, `${p} 때문에 힘드셨죠? 진짜 되는 꿀팁만`, `함께하면 ${c} ✨`],
    },
    {
      name: "③ 혜택·행동형",
      lines: [w, `📌 ${p} 해결 정보 매일 업데이트`, `👇 지금 팔로우하고 ${c}`],
    },
  ];
}

export function ProfileBioGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [who, setWho] = useState(initialData?.who ?? "");
  const [problem, setProblem] = useState(initialData?.problem ?? "");
  const [change, setChange] = useState(initialData?.change ?? "");
  const { saving, saved, save } = useGuideSave(taskId);
  const versions = buildVersions(who, problem, change);

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 leading-relaxed">
        아래 3가지를 채우면 인스타 프로필 <strong>3줄 바이오</strong>가 3버전으로 만들어져요. 마음에 드는 걸 복사해 프로필에 붙여넣고, 자유롭게 다듬으세요.
      </p>

      <div>
        <label className={FLABEL}>1) 나의 전문성 · 경력 · 수상 <span className="text-neutral-400 font-normal">(내가 누구인지 — 1번째 줄)</span></label>
        <input value={who} onChange={(e) => setWho(e.target.value)} className={FIELD} placeholder="예: 필라테스 8년차 · L2 지도자 · 자세교정 후기 300건" />
      </div>
      <div>
        <label className={FLABEL}>2) 소비자의 문제 · 궁금점 <span className="text-neutral-400 font-normal">(꿀팁을 줄 주제 — 2번째 줄)</span></label>
        <input value={problem} onChange={(e) => setProblem(e.target.value)} className={FIELD} placeholder="예: 거북목·라운드숄더" />
      </div>
      <div>
        <label className={FLABEL}>3) 팔로우·상품 사용 시 얻을 변화 <span className="text-neutral-400 font-normal">(3번째 줄)</span></label>
        <input value={change} onChange={(e) => setChange(e.target.value)} className={FIELD} placeholder="예: 통증 없는 바른 자세" />
      </div>

      <SaveButton onClick={() => save({ who, problem, change })} saving={saving} saved={saved} />

      <div className="space-y-3 pt-1">
        {versions.map((v) => {
          const text = v.lines.join("\n");
          return (
            <div key={v.name} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-neutral-700">{v.name}</p>
                <CopyButton text={text} />
              </div>
              <div className="text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">{text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
