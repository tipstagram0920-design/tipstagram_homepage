"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Mail, Upload, Loader2, X } from "lucide-react";

export function EbookStep2Form() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ebook/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "이미지 업로드 실패");
        return;
      }
      setScreenshotUrl(data.url);
    } catch {
      setError("업로드 중 오류");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      setError("스토리 스크린샷을 먼저 업로드해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ebook/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, screenshotUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "제출 실패");
        return;
      }
      setDone(true);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full ig-gradient text-white mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-3">제출 완료 🎉</h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          입력하신 이메일 <strong className="text-white">{email}</strong> 로<br/>
          2차 전자책 다운로드 링크를 보내드렸습니다.
        </p>
        <p className="text-white/40 text-xs mt-5">메일이 안 보이면 스팸함도 확인해주세요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 스크린샷 업로드 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          스토리 스크린샷
        </label>
        {!screenshotUrl ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-white/15 text-white/60 hover:border-pink-400 hover:text-pink-300 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-sm font-semibold">이미지 선택 (10MB 이하)</span>
                <span className="text-xs text-white/40">JPG · PNG · WEBP</span>
              </>
            )}
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt="스토리 스크린샷" className="w-full max-h-72 object-contain bg-black" />
            <button
              type="button"
              onClick={() => setScreenshotUrl("")}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white inline-flex items-center justify-center hover:bg-black/80"
              aria-label="이미지 제거"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
          className="hidden"
        />
      </div>

      {/* 이메일 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">이메일</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            inputMode="email"
            placeholder="1차 신청 때 쓴 이메일"
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
          />
        </div>
        <p className="text-xs text-white/40 mt-1.5">이 이메일로 2차 전자책 다운로드 링크를 보내드립니다.</p>
      </div>

      {/* 이름 (선택) */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          이름 <span className="text-xs text-white/40 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="비워두면 1차 신청 때 이름 사용"
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || uploading || !screenshotUrl}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl ig-gradient text-white font-bold text-base shadow-lg shadow-pink-900/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            제출 중...
          </>
        ) : (
          "2차 전자책 받기"
        )}
      </button>
    </form>
  );
}
