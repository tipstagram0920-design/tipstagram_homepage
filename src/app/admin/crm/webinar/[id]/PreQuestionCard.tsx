"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Copy, CheckCircle2, ExternalLink } from "lucide-react";

export function PreQuestionCard({
  campaignId,
  questionCount,
  url,
}: {
  campaignId: string;
  questionCount: number;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">사전 질문 페이지 · {questionCount}건 수신</p>
            <p className="text-xs text-neutral-500 mt-0.5">캠페인 생성과 함께 자동 생성됨 · 카톡·메일에 자동 삽입</p>
          </div>
        </div>
        <Link
          href={`/admin/crm/webinar/${campaignId}/questions`}
          className="text-xs font-semibold text-pink-600 hover:text-pink-700 shrink-0"
        >
          질문 리스트 →
        </Link>
      </div>

      <div className="flex items-stretch gap-2">
        <code className="flex-1 text-xs font-mono text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 truncate">
          {url}
        </code>
        <button
          onClick={copy}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500 inline-flex items-center gap-1.5 shrink-0"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 복사됨
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> 복사
            </>
          )}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500 inline-flex items-center gap-1.5 shrink-0"
        >
          <ExternalLink className="w-3 h-3" /> 열기
        </a>
      </div>
    </div>
  );
}
