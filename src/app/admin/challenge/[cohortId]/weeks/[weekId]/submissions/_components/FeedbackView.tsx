"use client";

// 강사 피드백 평문을 섹션별로 보기 좋게 렌더링.
// AI 출력 형식을 인식: "Q1./Q2. …" 항목, "총평:", "[릴스 후킹 제목 10개]" 등 [대괄호] 섹션, "1. 2. …" 번호 목록.

function isBracketSection(line: string) {
  return /^\[.+\]$/.test(line.trim());
}
function isQHeader(line: string) {
  return /^Q\d+\.\s*/.test(line.trim());
}
function isSummary(line: string) {
  return /^총평\s*[:：]/.test(line.trim());
}
function isNumbered(line: string) {
  return /^\d+[.)]\s+/.test(line.trim());
}

export function FeedbackView({ text }: { text: string }) {
  const trimmed = (text || "").trim();
  if (!trimmed) return <p className="text-sm text-neutral-400">아직 피드백이 없어요.</p>;

  const blocks = trimmed.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const first = lines[0].trim();

        // [섹션] — 릴스 후킹 제목, 릴스파이 등
        if (isBracketSection(first)) {
          const title = first.replace(/^\[|\]$/g, "");
          const rest = lines.slice(1);
          const numbered = rest.filter((l) => isNumbered(l));
          return (
            <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5">
              <p className="text-[13px] font-bold text-violet-700 mb-2">✦ {title}</p>
              {numbered.length > 0 ? (
                <ol className="space-y-1.5">
                  {rest.map((l, j) => {
                    const m = l.trim().match(/^\d+[.)]\s+(.*)$/);
                    if (!m) return l.trim() ? <p key={j} className="text-[13px] text-neutral-600">{l.trim()}</p> : null;
                    return (
                      <li key={j} className="flex gap-2 text-[13px] text-neutral-800">
                        <span className="font-bold text-violet-500 shrink-0">{l.trim().match(/^(\d+)/)?.[1]}.</span>
                        <span>{m[1]}</span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{rest.join("\n")}</p>
              )}
            </div>
          );
        }

        // 총평
        if (isSummary(first)) {
          const body = block.replace(/^총평\s*[:：]\s*/, "");
          return (
            <div key={i} className="rounded-xl border border-pink-100 bg-pink-50/50 p-3.5">
              <p className="text-[13px] font-bold text-pink-700 mb-1">총평</p>
              <p className="text-[13px] text-neutral-800 whitespace-pre-wrap leading-relaxed">{body}</p>
            </div>
          );
        }

        // Q 항목
        if (isQHeader(first)) {
          const body = lines.slice(1).join("\n").trim();
          return (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-3.5">
              <p className="text-[13px] font-bold text-neutral-900 mb-1">{first}</p>
              {body && (
                <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{body}</p>
              )}
            </div>
          );
        }

        // 일반 문단
        return (
          <p key={i} className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
