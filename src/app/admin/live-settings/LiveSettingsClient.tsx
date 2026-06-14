"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2 } from "lucide-react";

export function LiveSettingsClient({ initial }: { initial: { kakaoChatUrl: string } }) {
  const router = useRouter();
  const [url, setUrl] = useState(initial.kakaoChatUrl);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const trimmed = url.trim();
      if (trimmed && !/^https?:\/\//.test(trimmed)) {
        setError("URL은 http:// 또는 https:// 로 시작해야 합니다.");
        return;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "kakao_open_chat_url", value: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            카카오 오픈채팅 URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.kakao.com/o/..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            <code>/live</code> 페이지에서 신청한 사용자의 메일에 이 URL이 입장 링크로 들어갑니다.
          </p>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium"
          >
            <ExternalLink className="w-3 h-3" /> 현재 URL 열어보기
          </a>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}
        {saved && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4" /> 저장되었습니다.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
