"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Mail, User as UserIcon, ImagePlus, Loader2, X } from "lucide-react";

export function SummaryRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [agree, setAgree] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("10MB 이하 이미지만 가능해요.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ebook/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "업로드에 실패했어요.");
        return;
      }
      setScreenshotUrl(data.url);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { setError("개인정보 수집·이용에 동의해주세요."); return; }
    if (!screenshotUrl) { setError("스토리 스크린샷을 업로드해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/live/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, screenshotUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "신청 중 오류가 발생했어요.");
        return;
      }
      setDone(true);
    } catch {
      setError("네트워크 오류가 발생했어요.");
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
        <h2 className="text-xl sm:text-2xl font-black text-white mb-3">신청 완료 🎉</h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          <strong className="text-white">{email}</strong> 로<br/>
          강의 요약본을 발송했어요.
        </p>
        <p className="text-white/40 text-xs mt-5">메일이 안 보이면 스팸함도 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">이름</label>
        <div className="relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="홍길동"
            autoComplete="name"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
          />
        </div>
      </div>

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
            placeholder="example@email.com"
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* 스크린샷 업로드 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">스토리 스크린샷</label>
        {screenshotUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt="스크린샷" className="w-full max-h-64 object-contain" />
            <button
              type="button"
              onClick={() => setScreenshotUrl("")}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
              aria-label="다시 업로드"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 rounded-xl border-2 border-dashed border-white/20 text-white/60 hover:border-pink-400 hover:text-white flex flex-col items-center gap-2 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-6 h-6" />
                <span className="text-sm">스크린샷 선택 (JPG · PNG · 10MB 이하)</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <p className="text-xs text-white/40 mt-1.5">
          <strong className="text-white/60">@tipstagram2023</strong> 태그가 포함된 스토리 스크린샷을 올려주세요.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-pink-500 shrink-0"
        />
        <span className="text-xs text-white/65 leading-relaxed">
          강의 요약본 · 후속 콘텐츠 발송 목적의 개인정보 수집·이용에 동의합니다.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl ig-gradient text-white font-bold text-base shadow-lg shadow-pink-900/30 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            발송 중...
          </>
        ) : (
          "요약본 받기"
        )}
      </button>
    </form>
  );
}
