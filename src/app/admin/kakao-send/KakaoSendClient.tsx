"use client";

import { useState } from "react";
import { Loader2, Send, Check, MessageCircle } from "lucide-react";

type Channel = "kakao_alimtalk" | "kakao_friendtalk";

export function KakaoSendClient({
  tags,
  phoneCount,
  consentCount,
}: {
  tags: string[];
  phoneCount: number;
  consentCount: number;
}) {
  const [channel, setChannel] = useState<Channel>("kakao_alimtalk");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [templateKey, setTemplateKey] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ sent: number; failed: number; total: number; capped: boolean; errors: string[] } | null>(null);

  const isAlimtalk = channel === "kakao_alimtalk";
  const audienceHint = isAlimtalk
    ? `전화번호 보유 ${phoneCount}명 (정보성 — 수신동의 불필요)`
    : `친구톡 수신동의 ${consentCount}명 (마케팅 — 동의자만)`;

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const send = async () => {
    setError("");
    setResult(null);
    if (!body.trim()) {
      setError("메시지 내용을 입력해 주세요.");
      return;
    }
    if (isAlimtalk && !templateKey.trim()) {
      setError("알림톡은 카카오 승인 템플릿 코드가 필요합니다.");
      return;
    }
    const seg = selectedTags.length > 0 ? `태그 [${selectedTags.join(", ")}]` : "전체";
    if (
      !confirm(
        `${isAlimtalk ? "알림톡" : "친구톡"}을 ${seg} 대상에게 보냅니다.\n${audienceHint}\n\n실제 발송됩니다. 계속할까요?`
      )
    )
      return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/kakao-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, tags: selectedTags, templateKey: templateKey.trim(), body: body.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "발송 실패");
        return;
      }
      setResult(data);
    } catch {
      setError("네트워크 오류");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
        {/* 채널 선택 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-2">발송 채널</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "kakao_alimtalk", label: "알림톡", desc: "정보성 · 템플릿 필요" },
              { key: "kakao_friendtalk", label: "친구톡", desc: "마케팅 · 채널 친구만" },
            ] as const).map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setChannel(c.key)}
                className={
                  "text-left rounded-xl border p-3 transition " +
                  (channel === c.key
                    ? "border-pink-400 bg-pink-50/50 ring-1 ring-pink-200"
                    : "border-neutral-200 hover:border-neutral-300")
                }
              >
                <p className="text-sm font-bold text-neutral-900 inline-flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-yellow-500" /> {c.label}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-2">대상: {audienceHint}</p>
        </div>

        {/* 대상 태그 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-2">
            대상 태그 <span className="font-normal text-neutral-400">(선택 안 하면 전체)</span>
          </label>
          {tags.length === 0 ? (
            <p className="text-xs text-neutral-400">전화번호가 있는 컨택트에 아직 태그가 없어요. 전체로 발송됩니다.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={
                      "text-xs px-2.5 py-1.5 rounded-full border transition " +
                      (active
                        ? "border-pink-400 bg-pink-100 text-pink-700 font-bold"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300")
                    }
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 알림톡 템플릿 코드 */}
        {isAlimtalk && (
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">템플릿 코드</label>
            <input
              type="text"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              placeholder="카카오/Solapi에 승인된 알림톡 템플릿 코드"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              아래 내용은 승인된 템플릿과 <strong>동일해야</strong> 발송됩니다(변수 부분만 값 대체).
            </p>
          </div>
        )}

        {/* 메시지 내용 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">메시지 내용</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder={"보낼 메시지를 입력하세요.\n{{name}} 을 쓰면 받는 사람 이름으로 치환됩니다."}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1.5">{"{{name}}"} → 받는 사람 이름</p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        {result && (
          <div className="text-sm rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 space-y-1">
            <p className="font-bold text-neutral-800">
              발송 완료 — 성공 {result.sent}건 · 실패 {result.failed}건 (대상 {result.total}명)
            </p>
            {result.capped && (
              <p className="text-xs text-amber-600">※ 1회 상한(500명)까지만 발송했어요. 남은 대상은 다시 보내주세요.</p>
            )}
            {result.errors.length > 0 && (
              <p className="text-xs text-red-500">오류 예시: {result.errors.join(" / ")}</p>
            )}
          </div>
        )}

        <button
          onClick={send}
          disabled={busy}
          className="w-full py-3 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {busy ? "발송 중…" : "발송하기"}
        </button>
      </section>
    </div>
  );
}
