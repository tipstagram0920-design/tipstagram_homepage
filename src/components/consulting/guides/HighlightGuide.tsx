"use client";

import { useState } from "react";
import { useGuideSave, SaveButton, CopyButton, FIELD } from "./common";
import { ExternalLink, AlertCircle } from "lucide-react";

interface Data {
  consultUrl?: string;
}

const EMOJI_SITES = [
  { name: "미리캔버스", url: "https://www.miricanvas.com", note: "커버 템플릿·아이콘 (한글, 무료)" },
  { name: "Canva", url: "https://www.canva.com", note: "커버 디자인·요소 (무료 요소 다수)" },
  { name: "Flaticon", url: "https://www.flaticon.com", note: "아이콘 검색 (무료, 출처표기)" },
  { name: "Icons8", url: "https://icons8.com", note: "아이콘·이모지 (무료 플랜)" },
];

const ORDER = ["무료 또는 이벤트", "고객후기", "자주묻는질문", "상담하러 가기"];

export function HighlightGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [consultUrl, setConsultUrl] = useState(initialData?.consultUrl ?? "");
  const { saving, saved, save } = useGuideSave(taskId);

  return (
    <div className="space-y-4">
      {/* 순서 */}
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">✅ 하이라이트 순서</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ORDER.map((o, i) => (
            <span key={o} className="inline-flex items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-800 bg-neutral-100 rounded-lg px-2.5 py-1.5">
                {i + 1}. {o}
              </span>
              {i < ORDER.length - 1 && <span className="text-neutral-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 커버용 무료 이모티콘/아이콘 사이트 */}
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">🎨 커버 꾸미기 — 무료 이모티콘·아이콘 사이트</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EMOJI_SITES.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 hover:border-pink-400"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{s.note}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* 만드는 순서 */}
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">📝 하이라이트 만드는 순서</p>
        <ol className="space-y-2 text-[13px] text-neutral-700 leading-relaxed list-none">
          <li><strong>1.</strong> 위 사이트에서 통일감 있는 <strong>커버 4개</strong>를 만든다 (무료·이벤트 / 후기 / FAQ / 상담).</li>
          <li><strong>2.</strong> 각 주제로 <strong>스토리를 올린다.</strong> 이때 <strong className="text-pink-600">스토리에 반드시 &lsquo;상담하러 가기&rsquo; 링크 스티커(URL)를 넣는다.</strong></li>
          <li><strong>3.</strong> 올린 스토리를 <strong>하이라이트로 추가</strong>하고, 만든 커버로 <strong>커버 지정</strong> + 이름을 붙인다.</li>
          <li><strong>4.</strong> 순서를 <strong>무료·이벤트 → 후기 → FAQ → 상담하러 가기</strong>로 정렬한다.</li>
        </ol>
      </div>

      {/* 상담 URL 필수 알림 + 저장 */}
      <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3">
        <p className="text-[13px] font-bold text-pink-700 inline-flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-4 h-4" /> 스토리에 넣을 &lsquo;상담하러 가기&rsquo; URL
        </p>
        <p className="text-[12px] text-neutral-600 mb-2">
          이 링크를 스토리 <strong>링크 스티커</strong>로 꼭 넣으세요. 저장해두고 스토리 만들 때마다 복사해서 쓰면 편해요.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={consultUrl}
            onChange={(e) => setConsultUrl(e.target.value)}
            className={FIELD}
            placeholder="https://... (카톡 상담·상담 신청 폼 링크)"
          />
          {consultUrl.trim() && <CopyButton text={consultUrl.trim()} />}
        </div>
        <div className="mt-2">
          <SaveButton onClick={() => save({ consultUrl })} saving={saving} saved={saved} />
        </div>
      </div>
    </div>
  );
}
