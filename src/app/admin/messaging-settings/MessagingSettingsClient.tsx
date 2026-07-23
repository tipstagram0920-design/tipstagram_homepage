"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, KeyRound } from "lucide-react";

interface Props {
  initial: {
    hasApiKey: boolean;
    hasApiSecret: boolean;
    sender: string;
    pfId: string;
  };
}

export function MessagingSettingsClient({ initial }: Props) {
  const router = useRouter();
  // 시크릿은 기존 값을 화면에 안 채움. 새로 입력하면 그 값으로 덮어씀.
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [sender, setSender] = useState(initial.sender);
  const [pfId, setPfId] = useState(initial.pfId);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const updates: { key: string; value: string }[] = [
        { key: "solapi_sender_number", value: sender.trim() },
        { key: "solapi_kakao_pfid", value: pfId.trim() },
      ];
      // 시크릿은 새로 입력한 경우에만 저장(빈칸이면 기존 값 유지)
      if (apiKey.trim()) updates.push({ key: "solapi_api_key", value: apiKey.trim() });
      if (apiSecret.trim()) updates.push({ key: "solapi_api_secret", value: apiSecret.trim() });

      for (const u of updates) {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(u),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "저장 실패");
          return;
        }
      }
      setSaved(true);
      setApiKey("");
      setApiSecret("");
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
          <KeyRound className="w-4 h-4 text-pink-500" /> Solapi 자격증명
        </div>

        <Field label="API Key" hint={initial.hasApiKey ? "이미 설정됨 — 바꿀 때만 새로 입력" : "solapi.com > 개발/연동 > API Key"}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={initial.hasApiKey ? "••••••••  (변경 시에만 입력)" : "Solapi API Key"}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </Field>

        <Field label="API Secret" hint={initial.hasApiSecret ? "이미 설정됨 — 바꿀 때만 새로 입력" : "Solapi API Secret"}>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder={initial.hasApiSecret ? "••••••••  (변경 시에만 입력)" : "Solapi API Secret"}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </Field>

        <Field label="발신번호" hint="Solapi에 등록·인증된 발신 전화번호 (알림톡 SMS 대체발송·문자에 사용)">
          <input
            type="tel"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="01012345678"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </Field>

        <Field label="카카오 채널 pfId" hint="발신 카카오 채널(@팁스타그램)의 pfId. Solapi 카카오 채널 연동에서 확인">
          <input
            type="text"
            value={pfId}
            onChange={(e) => setPfId(e.target.value)}
            placeholder="예: KA01PF..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </Field>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
          {saved && (
            <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 저장되었습니다.
            </span>
          )}
        </div>
      </section>

      <p className="text-xs text-neutral-400 leading-relaxed">
        ※ 알림톡은 카카오에 <strong>사전 승인된 템플릿</strong>이 있어야 발송됩니다(Solapi 카카오 알림톡 템플릿 등록).
        친구톡은 받는 사람이 <strong>@팁스타그램 채널을 친구 추가</strong>한 경우에만 도달합니다.
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-800 mb-1.5">{label}</label>
      {children}
      <p className="text-xs text-neutral-500 mt-1.5">{hint}</p>
    </div>
  );
}
