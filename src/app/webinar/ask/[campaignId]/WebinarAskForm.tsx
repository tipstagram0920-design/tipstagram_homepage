"use client";

import { useState } from "react";
import { CheckCircle2, Mail, User as UserIcon, MessageSquare, Loader2 } from "lucide-react";

export function WebinarAskForm({ campaignId }: { campaignId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    if (!question.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/webinar/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, name, email, question }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "전송 중 오류가 발생했습니다.");
        return;
      }
      setDone(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
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
        <h2 className="text-xl sm:text-2xl font-black text-white mb-3">질문 잘 받았습니다</h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          라이브에서 익명으로 답해드릴게요.<br/>
          그날 만나요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">질문</label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            rows={5}
            placeholder="예: 콘텐츠는 매일 올리는 게 좋을까요?"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-y"
          />
        </div>
        <p className="text-xs text-white/40 mt-1.5">한 줄이어도 좋아요. 본인 상황을 짧게 적어주시면 더 정확히 답할 수 있어요.</p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-pink-500 shrink-0"
        />
        <span className="text-xs text-white/65 leading-relaxed">
          라이브 운영·답변 목적의 개인정보 수집·이용에 동의합니다.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl ig-gradient text-white font-bold text-base shadow-lg shadow-pink-900/30 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            보내는 중...
          </>
        ) : (
          "질문 보내기"
        )}
      </button>
    </form>
  );
}
