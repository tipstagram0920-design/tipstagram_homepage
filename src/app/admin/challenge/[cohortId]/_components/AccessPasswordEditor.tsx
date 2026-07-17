"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, KeyRound, Copy, ExternalLink } from "lucide-react";

export function AccessPasswordEditor({
  cohortId,
  cohortUrl,
  initialPassword,
}: {
  cohortId: string;
  cohortUrl: string;
  initialPassword: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState(initialPassword);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/challenge/${cohortId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessPassword: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${cohortUrl}` : cohortUrl;

  const copyGuide = async () => {
    const text =
      `[5주 챌린지 입장 안내]\n` +
      `1) 홈페이지에서 로그인 (없으면 회원가입)\n` +
      `2) 아래 링크 접속\n${fullUrl}\n` +
      (password.trim() ? `3) 입장 비밀번호 입력: ${password.trim()}\n` : "") +
      `※ 한 번 입장하면 다음부터는 로그인만 해도 들어올 수 있어요.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("복사에 실패했어요. 직접 선택해 복사해 주세요.");
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6">
      <h2 className="text-base font-bold text-neutral-800 inline-flex items-center gap-2 mb-1">
        <KeyRound className="w-4 h-4 text-pink-500" /> 입장 비밀번호 (공용)
      </h2>
      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        카톡방에 이 비밀번호를 공지하세요. 로그인한 참여자가 최초 1회 입력하면 참여자로 등록되고,
        다음부터는 로그인만 해도 입장됩니다. 비우면 상품 구매자만 입장할 수 있어요.
      </p>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="예: tips2607 (비우면 비번 입장 비활성)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="shrink-0 px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          저장
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {saved && (
        <p className="text-sm text-green-600 mt-2 inline-flex items-center gap-1.5">
          <Check className="w-4 h-4" /> 저장되었습니다.
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={cohortUrl}
          className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold"
        >
          {cohortUrl} <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={copyGuide}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-pink-400 hover:text-pink-600"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "복사됨" : "카톡 안내문 복사"}
        </button>
      </div>
    </div>
  );
}
