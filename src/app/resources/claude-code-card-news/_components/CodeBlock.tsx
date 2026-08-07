"use client";

import { useState } from "react";
import { Check, Copy, Terminal, FileText, MessageSquare } from "lucide-react";

export function CodeBlock({
  label,
  kind = "file",
  code,
}: {
  /** 블록 위에 붙는 설명 (예: "Claude 채팅창에 입력", "파일: CLAUDE.md") */
  label: string;
  /** panel = Claude 채팅창에 입력, file = 파일에 저장할 내용, terminal = 터미널 명령 */
  kind?: "terminal" | "file" | "panel";
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 클립보드 권한이 없으면 조용히 무시 (사용자가 직접 드래그 복사)
    }
  };

  const Icon = kind === "terminal" ? Terminal : kind === "panel" ? MessageSquare : FileText;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-2.5">
        <span className="inline-flex min-w-0 items-center gap-2 text-[11px] font-bold text-neutral-400">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 py-1 text-[11px] font-bold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white print:hidden"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-6 text-neutral-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** 초보자가 자주 막히는 지점에 붙이는 노란 주의 박스 */
export function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-[13px] font-bold text-amber-800">{title}</p>
      <div className="mt-1.5 space-y-1.5 text-[13px] leading-6 text-amber-900/80">{children}</div>
    </div>
  );
}
