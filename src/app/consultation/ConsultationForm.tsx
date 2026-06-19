"use client";

import { useState } from "react";
import { CheckCircle2, Mail, User as UserIcon, Phone, Instagram, Users as UsersIcon, Loader2 } from "lucide-react";

export function ConsultationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagramHandle: "",
    followerCount: "",
    painPoint: "",
  });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const update = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    if (form.painPoint.trim().length < 10) {
      setError("현재 고민을 10자 이상 적어주세요. 자세할수록 선정 확률이 높아집니다.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "신청 중 오류가 발생했습니다.");
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
        <h2 className="text-xl sm:text-2xl font-black text-white mb-3">신청 완료 🎯</h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          입력해주신 이메일 <strong className="text-white">{form.email}</strong> 로<br/>
          접수 안내 메일을 보내드렸습니다.
        </p>
        <p className="text-white/55 text-xs mt-5 leading-relaxed">
          선정 결과는 7월 8일(수) 저녁 8시 <strong className="text-white">무료 라이브</strong>에서 안내드릴게요.<br/>
          꼭 라이브에 참여해 주세요!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이름 */}
      <FieldRow icon={UserIcon} label="이름" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          required
          placeholder="홍길동"
          autoComplete="name"
          className="form-input"
        />
      </FieldRow>

      {/* 이메일 */}
      <FieldRow icon={Mail} label="이메일" required>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update({ email: e.target.value })}
          required
          inputMode="email"
          placeholder="example@email.com"
          autoComplete="email"
          className="form-input"
        />
      </FieldRow>

      {/* 휴대전화 */}
      <FieldRow icon={Phone} label="휴대전화">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update({ phone: e.target.value })}
          inputMode="tel"
          placeholder="010-1234-5678 (선택)"
          autoComplete="tel"
          className="form-input"
        />
      </FieldRow>

      {/* 인스타 핸들 */}
      <FieldRow icon={Instagram} label="진단받을 인스타 계정">
        <input
          type="text"
          value={form.instagramHandle}
          onChange={(e) => update({ instagramHandle: e.target.value })}
          placeholder="@본인_계정"
          className="form-input"
        />
      </FieldRow>

      {/* 팔로워 수 */}
      <FieldRow icon={UsersIcon} label="현재 팔로워">
        <input
          type="text"
          value={form.followerCount}
          onChange={(e) => update({ followerCount: e.target.value })}
          placeholder="예: 350명 / 1.2K / 미운영"
          className="form-input"
        />
      </FieldRow>

      {/* 고민 */}
      <div>
        <label className="block text-sm font-semibold text-white/85 mb-2">
          현재 가장 큰 고민 <span className="text-pink-400">*</span>
        </label>
        <textarea
          value={form.painPoint}
          onChange={(e) => update({ painPoint: e.target.value })}
          required
          rows={5}
          placeholder={
            "예) 한 달째 게시물 올리는데 도달이 30~50명에서 안 늘어납니다.\n" +
            "릴스를 만들기는 하는데 어떤 주제로 가야 할지 모르겠고,\n" +
            "팔로워 350명에서 매출은 0원입니다. 어디서부터 손봐야 할까요?"
          }
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-y leading-relaxed"
        />
        <p className="text-xs text-white/45 mt-1.5">
          ✏️ 구체적으로 적을수록 선정 확률이 높아집니다.
        </p>
      </div>

      {/* 동의 */}
      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-pink-500 shrink-0"
        />
        <span className="text-xs text-white/65 leading-relaxed">
          진단 세션 안내·관련 콘텐츠 발송 목적의 개인정보 수집·이용에 동의합니다.
          개인정보는 진단 세션 운영·안내 목적으로만 사용되며, 신청자가 요청 시 즉시 파기됩니다.
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
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl ig-gradient text-white font-bold text-base shadow-lg shadow-pink-900/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            신청 중...
          </>
        ) : (
          "진단 세션 신청하기"
        )}
      </button>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.form-input::placeholder) {
          color: rgba(255, 255, 255, 0.3);
        }
        :global(.form-input:focus) {
          border-color: #f472b6;
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </form>
  );
}

function FieldRow({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/85 mb-2">
        {label}
        {required && <span className="text-pink-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        {children}
      </div>
    </div>
  );
}
