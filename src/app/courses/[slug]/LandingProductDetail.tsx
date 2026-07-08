"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface Props {
  productId: string;
  productSlug: string;
  title: string;
  price: number;
  descriptionDesign: string;
  externalCheckoutUrl: string | null;
  hasPurchased: boolean;
  userEmail: string | null;
}

/**
 * 상품 상세 페이지에 descriptionDesign(HTML) 이 저장된 경우 사용되는 랜딩 모드.
 * · HTML을 전체폭(자체 max-width 컨테이너)으로 렌더링
 * · 하단에 고정 결제 바 (모바일·데스크톱 공통)
 */
export function LandingProductDetail({
  productId,
  productSlug,
  title,
  price,
  descriptionDesign,
  externalCheckoutUrl,
  hasPurchased,
  userEmail,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showBar, setShowBar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const autoBuyDone = useRef(false);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const runCheckout = useCallback(async () => {
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payment/prepare-external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.redirectUrl) {
        if (externalCheckoutUrl) {
          window.location.href = externalCheckoutUrl;
          return;
        }
        setErrorMsg(data.error || "결제 준비에 실패했어요.");
        return;
      }
      // 같은 창에서 이동 (결제 완료 후 리다이렉트 복귀가 자연스러움)
      window.location.href = data.redirectUrl;
    } catch {
      if (externalCheckoutUrl) {
        window.location.href = externalCheckoutUrl;
      } else {
        setErrorMsg("네트워크 오류가 발생했어요.");
      }
    } finally {
      setBusy(false);
    }
  }, [productId, productSlug, externalCheckoutUrl]);

  const handleBuy = () => {
    // 비로그인 → 회원가입 페이지로. 가입 완료 후 이 페이지의 ?autobuy=1 로 복귀
    if (!userEmail) {
      const returnUrl = `/courses/${productSlug}?autobuy=1`;
      router.push(`/register?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    void runCheckout();
  };

  // 회원가입 → 리다이렉트 복귀 시 자동으로 결제 개시
  useEffect(() => {
    if (autoBuyDone.current) return;
    if (searchParams.get("autobuy") !== "1") return;
    if (!userEmail || hasPurchased) return;
    autoBuyDone.current = true;
    // ?autobuy 파라미터 URL 정리
    const url = new URL(window.location.href);
    url.searchParams.delete("autobuy");
    window.history.replaceState({}, "", url.toString());
    void runCheckout();
  }, [searchParams, userEmail, hasPurchased, runCheckout]);

  return (
    <>
      <div
        className="product-landing"
        dangerouslySetInnerHTML={{ __html: descriptionDesign }}
      />

      {/* 하단 sticky 결제 바 */}
      <div
        className={
          "fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur transition-transform duration-300 " +
          (showBar ? "translate-y-0" : "translate-y-full")
        }
        aria-hidden={!showBar}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">{title}</p>
            <p className="text-lg font-black text-neutral-900">{formatPrice(price)}</p>
          </div>
          {hasPurchased ? (
            <span className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-600">
              이미 구매하신 상품입니다
            </span>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={handleBuy}
                disabled={busy}
                className="ig-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/25 hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "결제 준비 중..." : "지금 신청하기 →"}
              </button>
              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
            </div>
          )}
        </div>
      </div>

      {/* 바가 페이지 콘텐츠를 가리지 않도록 여백 확보 */}
      <div aria-hidden className="h-24" />

      {/* 상품 상세 랜딩 HTML 스코프 안에서만 Tailwind Preflight 영향 최소화 */}
      <style jsx global>{`
        .product-landing {
          all: revert;
        }
        .product-landing * {
          box-sizing: border-box;
        }
      `}</style>
      {/* productId prop 은 앞으로 결제·후기 등 확장용 (지금은 미사용) */}
      <span hidden data-product-id={productId} />
    </>
  );
}
