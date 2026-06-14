"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Upload } from "lucide-react";

interface Props {
  initial: { kakaoChatUrl: string; ebookUrl: string };
}

export function LiveSettingsClient({ initial }: Props) {
  const router = useRouter();
  const [chatUrl, setChatUrl] = useState(initial.kakaoChatUrl);
  const [ebookUrl, setEbookUrl] = useState(initial.ebookUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const validateUrl = (v: string) => !v || /^https?:\/\//.test(v);

  const saveOne = async (key: string, value: string) => {
    if (!validateUrl(value)) {
      setError("URL은 http:// 또는 https:// 로 시작해야 합니다.");
      return;
    }
    setError("");
    setSavedKey(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: value.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      setSavedKey(key);
      router.refresh();
      setTimeout(() => setSavedKey(null), 2500);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "업로드 실패");
        return;
      }
      setEbookUrl(data.url);
    } catch {
      setError("업로드 중 오류");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* 카카오 오픈채팅 URL */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            카카오 오픈채팅 URL
          </label>
          <input
            type="url"
            value={chatUrl}
            onChange={(e) => setChatUrl(e.target.value)}
            placeholder="https://open.kakao.com/o/..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            신청자 메일의 <strong>대기방 입장하기</strong> 버튼 링크.
          </p>
        </div>
        {chatUrl && (
          <a href={chatUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium">
            <ExternalLink className="w-3 h-3" /> 현재 URL 열어보기
          </a>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveOne("kakao_open_chat_url", chatUrl)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
          {savedKey === "kakao_open_chat_url" && (
            <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 저장되었습니다.
            </span>
          )}
        </div>
      </section>

      {/* e-Book URL */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-neutral-800">
              인스타 수익화 10가지 질문 e-Book URL
            </label>
            <div className="flex items-center gap-2">
              {ebookUrl && (
                <button
                  type="button"
                  onClick={() => setEbookUrl("")}
                  className="text-xs px-2.5 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  지우기
                </button>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-pink-300 hover:text-pink-500 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? "업로드 중..." : "파일에서 업로드"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,application/epub+zip,image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>
          <input
            type="url"
            value={ebookUrl}
            onChange={(e) => setEbookUrl(e.target.value)}
            placeholder="https://... 또는 파일에서 업로드"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            신청자 메일의 <strong>10가지 질문 다운로드</strong> 버튼 링크. 비워두면 메일에서 해당 섹션이 숨겨집니다.
          </p>
        </div>
        {ebookUrl && (
          <a href={ebookUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium">
            <ExternalLink className="w-3 h-3" /> 현재 파일 열어보기
          </a>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveOne("live_ebook_url", ebookUrl)}
            disabled={loading || uploading}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
          {savedKey === "live_ebook_url" && (
            <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 저장되었습니다.
            </span>
          )}
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}
    </div>
  );
}
