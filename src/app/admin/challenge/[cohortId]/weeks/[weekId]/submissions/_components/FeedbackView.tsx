"use client";

import React from "react";

// 강사 피드백 평문을 섹션별로 보기 좋게 렌더링.
// 인식: "Q1./Q2. …" 항목, "총평:", "[릴스 후킹 제목 10개]"·"[관련 참고 릴스]" 등 [대괄호] 섹션, "1. 2. …" 번호 목록.
// URL은 클릭 가능한 링크로 변환.

const URL_RE = /(https?:\/\/[^\s]+)/g;

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 underline break-all"
          >
            {p}
          </a>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

function isBracketSection(line: string) {
  return /^\[.+\]$/.test(line.trim());
}
function isQHeader(line: string) {
  return /^Q\d+\.\s*/.test(line.trim());
}
function isSummary(line: string) {
  return /^총평\s*[:：]/.test(line.trim());
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

        if (isBracketSection(first)) {
          const title = first.replace(/^\[|\]$/g, "");
          const rest = lines.slice(1).filter((l) => l.trim());
          return (
            <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5">
              <p className="text-[13px] font-bold text-violet-700 mb-2">✦ {title}</p>
              <div className="space-y-1">
                {rest.map((l, j) => {
                  const m = l.trim().match(/^(\d+)[.)]\s+(.*)$/);
                  if (m) {
                    return (
                      <div key={j} className="flex gap-2 text-[13px] text-neutral-800">
                        <span className="font-bold text-violet-500 shrink-0">{m[1]}.</span>
                        <span>
                          <Linkified text={m[2]} />
                        </span>
                      </div>
                    );
                  }
                  return (
                    <p key={j} className="text-[12px] text-neutral-500">
                      <Linkified text={l.trim()} />
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        if (isSummary(first)) {
          const body = block.replace(/^총평\s*[:：]\s*/, "");
          return (
            <div key={i} className="rounded-xl border border-pink-100 bg-pink-50/50 p-3.5">
              <p className="text-[13px] font-bold text-pink-700 mb-1">총평</p>
              <p className="text-[13px] text-neutral-800 whitespace-pre-wrap leading-relaxed">
                <Linkified text={body} />
              </p>
            </div>
          );
        }

        if (isQHeader(first)) {
          const body = lines.slice(1).join("\n").trim();
          return (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-3.5">
              <p className="text-[13px] font-bold text-neutral-900 mb-1">{first}</p>
              {body && (
                <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  <Linkified text={body} />
                </p>
              )}
            </div>
          );
        }

        return (
          <p key={i} className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
            <Linkified text={block} />
          </p>
        );
      })}
    </div>
  );
}
