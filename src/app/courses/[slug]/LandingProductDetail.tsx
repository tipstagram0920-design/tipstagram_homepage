"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface Props {
  productId: string;
  title: string;
  price: number;
  descriptionDesign: string;
  externalCheckoutUrl: string | null;
  hasPurchased: boolean;
}

/**
 * 상품 상세 페이지에 descriptionDesign(HTML) 이 저장된 경우 사용되는 랜딩 모드.
 * · HTML을 전체폭(자체 max-width 컨테이너)으로 렌더링
 * · 하단에 고정 결제 바 (모바일·데스크톱 공통)
 */
export function LandingProductDetail({
  productId,
  title,
  price,
  descriptionDesign,
  externalCheckoutUrl,
  hasPurchased,
}: Props) {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBuy = () => {
    if (externalCheckoutUrl) {
      window.open(externalCheckoutUrl, "_blank", "noopener");
    }
  };

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
            <button
              type="button"
              onClick={handleBuy}
              className="ig-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/25 hover:opacity-90"
            >
              지금 신청하기 →
            </button>
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
