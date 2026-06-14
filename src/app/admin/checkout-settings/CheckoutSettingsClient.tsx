"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2 } from "lucide-react";

export function CheckoutSettingsClient({
  initial,
}: {
  initial: { externalCheckoutUrl: string };
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initial.externalCheckoutUrl);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    setSaved(false);
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//.test(trimmed)) {
      setError("URL은 http:// 또는 https:// 로 시작해야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "external_checkout_url", value: trimmed }),
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            외부 결제 URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://other-site.com/checkout (비워두면 내부 결제)"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            모든 상품의 결제 버튼이 이 URL로 연결됩니다.<br/>
            나중에 상품별로 다르게 하려면 상품 모델에 컬럼을 추가하면 됩니다.
          </p>
        </div>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium">
            <ExternalLink className="w-3 h-3" /> URL 열어보기
          </a>
        )}
        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
        {saved && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4" /> 저장되었습니다.
          </p>
        )}
        <button
          onClick={save}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          저장
        </button>
      </section>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <p className="font-bold mb-1">참고</p>
        <ul className="list-disc list-outside pl-5 space-y-1 text-xs">
          <li>외부 URL이 설정되면 강의 상세 페이지의 결제 버튼은 새 탭에서 그 URL을 엽니다.</li>
          <li>로그인 없이도 결제 페이지로 이동할 수 있게 됩니다 (외부 사이트가 별도 인증).</li>
          <li>구매 완료 후의 강의 부여는 어드민에서 수동으로 처리해야 합니다 — 컨택트 상세의 "강의 수동 부여" 액션 사용.</li>
        </ul>
      </div>
    </div>
  );
}
