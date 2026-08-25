"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, MessageCircle, ExternalLink } from "lucide-react";

/**
 * 기수별 카카오 오픈채팅방 URL 편집기.
 *
 * 기수마다 방을 새로 열기 때문에 전역 설정이 아니라 기수에 매단다.
 * (전역 `kakao_open_chat_url` 은 라이브 신청용이라 여기서 재사용하면 안 된다)
 * 값이 있으면 구매자의 강의실·기수 화면에 입장 버튼이 뜨고, 비우면 숨는다.
 */
export function OpenChatUrlEditor({
  cohortId,
  initialUrl,
}: {
  cohortId: string;
  initialUrl: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setSaved(false);
    const value = url.trim();
    // 오타로 엉뚱한 주소를 걸어두면 구매자가 빈 방으로 간다 — 저장 전에 형태만 확인한다
    if (value && !/^https?:\/\//i.test(value)) {
      setError("http:// 또는 https:// 로 시작하는 주소를 넣어주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/challenge/${cohortId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openChatUrl: value }),
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

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6">
      <h2 className="text-base font-bold text-neutral-800 inline-flex items-center gap-2 mb-1">
        <MessageCircle className="w-4 h-4 text-pink-500" /> 카카오 오픈채팅방
      </h2>
      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        이 기수 전용 방 주소입니다. 넣어두면 결제한 사람의 강의실과 이 기수 화면에 입장 버튼이 뜹니다.
        기수를 새로 열 때마다 방도 새로 만들어 이 값만 바꾸면 됩니다. 비우면 버튼이 사라집니다.
      </p>

      <div className="flex items-center gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://open.kakao.com/o/..."
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

      {url.trim() && (
        <a
          href={url.trim()}
          target="_blank"
          rel="noreferrer"
          className="mt-4 pt-4 border-t border-neutral-100 inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold"
        >
          방 열어보기 <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
