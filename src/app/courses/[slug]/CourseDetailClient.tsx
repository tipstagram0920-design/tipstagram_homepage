"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Play, Lock, Tag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  vimeoId?: string | null;
  duration?: number | null;
  order: number;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  price: number;
  thumbnail?: string | null;
  highlights: string[];
  course?: {
    sections: Section[];
  } | null;
}

interface CourseDetailClientProps {
  product: Product;
  hasPurchased: boolean;
  isLoggedIn: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CourseDetailClient({ product, hasPurchased, isLoggedIn }: CourseDetailClientProps) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([product.course?.sections[0]?.id || ""]));
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "유효하지 않은 쿠폰입니다.");
        return;
      }
      const discountAmount = data.type === "PERCENT"
        ? Math.floor((product.price * data.discount) / 100)
        : data.discount;
      setDiscount(discountAmount);
      setCouponApplied(true);
      setCouponId(data.id);
    } catch {
      setCouponError("쿠폰 확인 중 오류가 발생했습니다.");
    }
  };

  const finalPrice = Math.max(0, product.price - discount);

  const handlePayment = async () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=" + encodeURIComponent("/courses/" + product.slug));
      return;
    }
    if (hasPurchased) {
      router.push("/classroom");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, couponId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Toss Payments 위젯 결제
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: data.customerKey });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: finalPrice },
        orderId: data.orderId,
        orderName: product.title,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error(err);
      alert("결제 준비 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalLessons = product.course?.sections.reduce((acc, s) => acc + s.lessons.length, 0) || 0;

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Course Info */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-neutral-100">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full ig-gradient flex items-center justify-center">
                  <span className="text-white text-6xl font-black italic">T</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mt-8">
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-3 text-lg text-neutral-500">{product.subtitle}</p>
              )}
            </div>

            {/* Highlights */}
            {product.highlights.length > 0 && (
              <div className="mt-8 p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
                <h3 className="font-bold text-neutral-900 mb-4">이런 것을 배울 수 있어요</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {product.course && product.course.sections.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">커리큘럼</h3>
                <p className="text-sm text-neutral-500 mb-5">
                  총 {product.course.sections.length}섹션 · {totalLessons}강
                </p>
                <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
                  {product.course.sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900">{section.title}</span>
                          <span className="text-xs text-neutral-400 ml-2">{section.lessons.length}강</span>
                        </div>
                        {openSections.has(section.id)
                          ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                          : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                      </button>
                      {openSections.has(section.id) && (
                        <div className="divide-y divide-neutral-50">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-neutral-50">
                              <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                                {lesson.isFree
                                  ? <Play className="w-3 h-3 text-pink-500 fill-pink-500" />
                                  : <Lock className="w-3 h-3 text-neutral-400" />}
                              </div>
                              <span className="text-sm text-neutral-700 flex-1">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-xs text-neutral-400">{formatDuration(lesson.duration)}</span>
                              )}
                              {lesson.isFree && (
                                <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                                  무료
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">강의 소개</h3>
              <div
                className="tiptap-content text-neutral-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>

          {/* Right: Payment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="text-3xl font-black text-neutral-900 mb-1">
                  {formatPrice(finalPrice)}
                </div>
                {discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 line-through text-sm">{formatPrice(product.price)}</span>
                    <span className="text-sm font-semibold text-pink-600">
                      -{formatPrice(discount)} 할인
                    </span>
                  </div>
                )}

                {/* Coupon */}
                {!hasPurchased && (
                  <div className="mt-5">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="쿠폰 코드 입력"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={couponApplied}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 disabled:bg-neutral-50"
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        disabled={!couponCode || couponApplied}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                      >
                        {couponApplied ? "적용됨" : "적용"}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                    {couponApplied && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3" /> 쿠폰이 적용되었습니다
                      </p>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={cn(
                    "mt-5 w-full py-4 rounded-xl font-bold text-white transition-all",
                    hasPurchased
                      ? "bg-green-500 hover:bg-green-600"
                      : "ig-gradient hover:opacity-90",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isProcessing
                    ? "처리 중..."
                    : hasPurchased
                    ? "강의 바로 듣기"
                    : isLoggedIn
                    ? "결제하기"
                    : "로그인하고 수강신청"}
                </button>

                {/* Features */}
                <ul className="mt-5 space-y-2.5">
                  {[
                    "평생 수강 가능",
                    "모바일 / PC 모두 지원",
                    "수료증 발급",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-500">
                      <Check className="w-4 h-4 text-pink-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
