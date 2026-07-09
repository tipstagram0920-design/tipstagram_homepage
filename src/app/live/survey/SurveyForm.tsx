"use client";

import { useState } from "react";
import { CheckCircle2, Mail, User as UserIcon, Loader2 } from "lucide-react";

const CHANNEL_OPTIONS = [
  "인스타그램 광고",
  "인스타그램 팔로우 · 게시물",
  "지인 · 소개",
  "유튜브",
  "네이버 검색",
  "카톡 오픈채팅방",
  "기타",
];

type PaidSignup = "yes" | "no" | "";

export function SurveyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channelSource, setChannelSource] = useState("");
  const [channelDetail, setChannelDetail] = useState(""); // "기타" 선택 시 자유 입력
  const [goodPoints, setGoodPoints] = useState("");
  const [badPoints, setBadPoints] = useState("");
  const [paidSignup, setPaidSignup] = useState<PaidSignup>("");
  const [paidReason, setPaidReason] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    if (!channelSource) {
      setError("무료 강의를 어디서 알게 되셨는지 선택해주세요.");
      return;
    }
    if (!goodPoints.trim() || !badPoints.trim()) {
      setError("좋았던 점과 아쉬운 점을 모두 남겨주세요.");
      return;
    }
    if (!paidSignup) {
      setError("유료 강의 신청 여부를 선택해주세요.");
      return;
    }
    if (!paidReason.trim()) {
      setError(
        paidSignup === "yes"
          ? "유료 강의를 신청한 이유를 남겨주세요."
          : "유료 강의를 신청하지 않은 이유를 남겨주세요."
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/live/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          channelSource:
            channelSource === "기타" && channelDetail.trim()
              ? `기타: ${channelDetail.trim()}`
              : channelSource,
          goodPoints,
          badPoints,
          hasPaidSignup: paidSignup === "yes",
          paidReason,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "제출 중 오류가 발생했어요.");
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
        <h2 className="text-xl sm:text-2xl font-black text-white mb-3">응답 감사합니다 🎉</h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          <strong className="text-white">{email}</strong> 로<br />
          자료 세 가지(요약본 · FAQ · 후킹 패턴)를 발송했어요.
        </p>
        <p className="text-white/40 text-xs mt-5">메일이 안 보이면 스팸함도 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* 이름 */}
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
            placeholder="example@email.com"
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* Q1. 유입 채널 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          Q1. 무료 강의를 어디서 알게 되셨나요?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setChannelSource(opt)}
              className={
                "px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors text-left " +
                (channelSource === opt
                  ? "border-pink-400 bg-pink-500/20 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30")
              }
            >
              {opt}
            </button>
          ))}
        </div>
        {channelSource === "기타" && (
          <input
            type="text"
            value={channelDetail}
            onChange={(e) => setChannelDetail(e.target.value)}
            placeholder="어디서 알게 되셨는지 짧게 남겨주세요"
            className="mt-3 w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08]"
          />
        )}
      </div>

      {/* Q2. 좋았던 점 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          Q2. 무료 강의에서 <span className="text-amber-300">좋았던 점</span>은 무엇인가요?
        </label>
        <textarea
          value={goodPoints}
          onChange={(e) => setGoodPoints(e.target.value)}
          required
          rows={4}
          maxLength={800}
          placeholder="가장 인상 깊었던 부분·활용해보고 싶은 점을 자유롭게 남겨주세요."
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
        />
        <p className="mt-1 text-xs text-white/40 text-right">{goodPoints.length} / 800</p>
      </div>

      {/* Q3. 아쉬운 점 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          Q3. 무료 강의에서 <span className="text-amber-300">아쉬운 점</span>은 무엇인가요?
        </label>
        <textarea
          value={badPoints}
          onChange={(e) => setBadPoints(e.target.value)}
          required
          rows={4}
          maxLength={800}
          placeholder="더 궁금했던 것·부족했던 부분을 솔직하게 남겨주시면 다음 라이브에 반영해요."
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
        />
        <p className="mt-1 text-xs text-white/40 text-right">{badPoints.length} / 800</p>
      </div>

      {/* Q4. 유료 강의 신청 여부 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          Q4. 유료 강의를 신청하셨나요?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaidSignup("yes")}
            className={
              "px-3 py-3 rounded-xl text-sm font-bold border transition-colors " +
              (paidSignup === "yes"
                ? "border-pink-400 bg-pink-500/20 text-white"
                : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30")
            }
          >
            네, 신청했어요
          </button>
          <button
            type="button"
            onClick={() => setPaidSignup("no")}
            className={
              "px-3 py-3 rounded-xl text-sm font-bold border transition-colors " +
              (paidSignup === "no"
                ? "border-pink-400 bg-pink-500/20 text-white"
                : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30")
            }
          >
            아직 안 했어요
          </button>
        </div>
      </div>

      {/* Q5. 신청/미신청 이유 */}
      {paidSignup && (
        <div>
          <label className="block text-sm font-semibold text-white/85 mb-2">
            {paidSignup === "yes"
              ? "Q5. 유료 강의를 신청한 이유는 무엇인가요?"
              : "Q5. 아직 신청하지 않은 이유는 무엇인가요?"}
          </label>
          <textarea
            value={paidReason}
            onChange={(e) => setPaidReason(e.target.value)}
            required
            rows={4}
            maxLength={800}
            placeholder={
              paidSignup === "yes"
                ? "어떤 점이 결정에 가장 크게 작용했는지 남겨주세요."
                : "가격·시기·정보 부족 등 솔직한 이유를 남겨주세요. 아이디어에 반영합니다."
            }
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
          />
          <p className="mt-1 text-xs text-white/40 text-right">{paidReason.length} / 800</p>
        </div>
      )}

      {/* 동의 */}
      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-pink-500 shrink-0"
        />
        <span className="text-xs text-white/65 leading-relaxed">
          자료 발송·후속 안내 목적의 개인정보 수집·이용에 동의합니다.
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
            제출 중...
          </>
        ) : (
          "설문 제출하고 자료 3종 받기"
        )}
      </button>
    </form>
  );
}
