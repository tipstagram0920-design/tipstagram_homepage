"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Tag, Play, ChevronDown, ChevronUp, Star, Quote } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Product { id: string; slug: string; title: string; price: number; }
interface Props { product: Product; hasPurchased: boolean; isLoggedIn: boolean; }

const VIDEOS = [
  { id: "xoKonrtL5ZM", name: "김○○ 수강생", desc: "평범한 사람이 5만 팔로워, 2달 만에 1,800만원 공구 매출" },
  { id: "K4XmUAOnZaE", name: "나○○ 수강생", desc: "매출이 5배 상승. 내 브랜드로 수익 전환하는 법을 배웠어요" },
  { id: "lmT1LR6a16I", name: "홍○○ 수강생", desc: "인스타그램이 두렵지 않고 재밌어졌습니다. 목표 매출 달성!" },
];

const REVIEWS = [
  { name: "미숙○", tag: "@grace.um_prof", rating: 5, text: "팔로워 수 890만을 달성했습니다! 팁스타그램 덕분에 제 계정이 완전히 달라졌어요. 수강 전에는 어떻게 해야 할지 막막했는데, 지금은 매일 성장하는 게 느껴져요.", highlight: "팔로워 890만 달성" },
  { name: "수강생○", tag: "@tipstagram_user", rating: 5, text: "매출이 5배나 올랐어요. 강의 하나로 이렇게 변화할 수 있다는 게 놀랍습니다. 특히 세일즈 페이지 만드는 법이 정말 도움이 됐어요.", highlight: "매출 5배 상승" },
  { name: "박○○", tag: "@park_creator", rating: 5, text: "70대인 저도 할 수 있었어요. 쉽게 설명해주셔서 따라가다 보니 어느새 팔로워가 늘고 DM 문의도 오기 시작했습니다.", highlight: "70대도 성공!" },
  { name: "이○○", tag: "@lee_insta", rating: 5, text: "1주일 만에 매출이 생겼어요. 처음에 반신반의했는데 강의 내용대로 실천했더니 정말 됐습니다.", highlight: "1주 만에 첫 매출" },
  { name: "최○○", tag: "@choi_brand", rating: 5, text: "비슷한 다른 강의들과 비교가 안 될 정도로 내용이 알차요. 실전에서 바로 쓸 수 있는 것들만 모아놨어요.", highlight: "압도적인 콘텐츠" },
  { name: "정○○", tag: "@jeong_biz", rating: 5, text: "Q&A에서 빠르게 답변해주셔서 막히는 부분 없이 진행할 수 있었어요. 커뮤니티도 활발해서 동기부여가 됩니다.", highlight: "최고의 커뮤니티" },
];

const CURRICULUM = [
  { num: "01", label: "인스타 프로필 만들기", items: ["인스타그램 세팅 필수 사항", "팔로워가 모이는 프로필 작성법", "프로페셔널 계정 전환 방법", "하이라이트 활용 전략", "기관 기업 제안 요청"] },
  { num: "02", label: "인스타그램 게시물 작성법", items: ["알고리즘에 노출되는 게시물 형식", "팔로워 반응을 높이는 캡션 작성", "해시태그 전략", "게시물 최적 업로드 시간", "저장 & 공유를 부르는 콘텐츠"] },
  { num: "03", label: "릴스 부스터", items: ["팔로워를 폭발적으로 늘리는 릴스 기획", "릴스 제작 핵심 노하우", "릴스 알고리즘 공략법", "바이럴 릴스 사례 분석", "쇼츠 & 릴스 연동 전략"] },
  { num: "04", label: "세일즈 페이지 만들기", items: ["구매 전환율을 높이는 페이지 구조", "고객 심리를 이용한 설득 전략", "신뢰를 주는 후기 활용법", "원클릭 구매 동선 만들기"] },
  { num: "05", label: "카피라이팅 비법", items: ["마음을 움직이는 카피 공식", "제품별 카피 작성 실습", "클릭을 부르는 제목 작성법", "감정을 자극하는 스토리텔링"] },
  { num: "06", label: "카카오 & 링크 활용", items: ["카카오 채널 연동법", "링크 인 바이오 최적화", "오픈채팅방 운영 전략", "자동화 DM 세팅"] },
  { num: "07", label: "라이브 방송 마케팅", items: ["라이브 방송으로 즉시 매출 올리기", "라이브 전 준비 사항", "시청자를 구매자로 전환하는 멘트", "라이브 후 팔로업 전략"] },
  { num: "08", label: "브랜딩과 아이덴티티 만들기", items: ["기억에 남는 브랜드 색깔 정하기", "피드 통일감 있게 꾸미기", "나만의 콘텐츠 세계관 구축", "브랜드 스토리 만들기"] },
  { num: "09", label: "세일즈 매일 설정하기", items: ["자는 동안에도 팔리는 구조 설계", "상품 페이지 고객 유입법", "소상공인 브랜드 매출 자동화", "월 반복 수익 만드는 시스템"] },
];

const COMPARISON = [
  { label: "수익화 전략 포함", them: false, us: true },
  { label: "실전 커뮤니티 운영", them: false, us: true },
  { label: "무제한 Q&A 지원", them: false, us: true },
  { label: "라이브 방송 전략", them: false, us: true },
  { label: "카피라이팅 실습", them: false, us: true },
  { label: "1:1 피드백", them: false, us: true },
  { label: "세일즈 페이지 제작", them: false, us: true },
  { label: "자동 매출 시스템", them: false, us: true },
];

const BENEFITS = [
  { icon: "🎬", title: "전체 영상 강의", desc: "언제 어디서나 반복 시청 가능" },
  { icon: "💬", title: "무제한 Q&A", desc: "궁금한 것은 무엇이든 질문" },
  { icon: "👥", title: "수강생 커뮤니티", desc: "함께 성장하는 오픈채팅방" },
  { icon: "📝", title: "카피라이팅 템플릿", desc: "바로 쓸 수 있는 카피 템플릿" },
  { icon: "📊", title: "세일즈 페이지 예시", desc: "실제 판매되는 페이지 예시 자료" },
  { icon: "🔴", title: "라이브 방송 특강", desc: "정기적인 라이브 Q&A 특강" },
  { icon: "📱", title: "릴스 기획 템플릿", desc: "바이럴 릴스 기획서 템플릿" },
  { icon: "🎯", title: "타겟 설정 가이드", desc: "나의 타겟 고객을 정의하는 워크시트" },
  { icon: "💰", title: "수익화 로드맵", desc: "단계별 인스타 수익화 로드맵" },
  { icon: "⚡", title: "20일 챌린지", desc: "수강 후 20일 실천 챌린지 참여" },
  { icon: "📈", title: "성과 분석 도구", desc: "인사이트 분석 체크리스트" },
  { icon: "🏆", title: "수강 완료 인증서", desc: "수료증 발급" },
];

const STUDENT_TYPES = [
  { label: "수강생 A", result: "팔로워 3만 달성", detail: "처음에는 팔로워가 200명도 안 됐는데, 강의를 들은 후 3만 명을 넘었어요." },
  { label: "수강생 B", result: "매출 2배 증가", detail: "같은 제품인데 인스타 운영법을 바꾸자마자 매출이 2배로 올랐습니다." },
  { label: "수강생 C", result: "월등한 성과 달성", detail: "경쟁자들과 비교했을 때 압도적인 차이가 생겼어요. 알고리즘을 이해하는 게 핵심이더라고요." },
  { label: "수강생 D", result: "1수간 매출 1만원 달성", detail: "강의 시작 1주일 만에 처음으로 인스타를 통해 매출이 발생했습니다!" },
];

export function BoosterSalesPage({ product, hasPurchased, isLoggedIn }: Props) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const finalPrice = Math.max(0, product.price - discount);

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || "유효하지 않은 쿠폰입니다."); return; }
      const discountAmount = data.type === "PERCENT"
        ? Math.floor((product.price * data.discount) / 100)
        : data.discount;
      setDiscount(discountAmount);
      setCouponApplied(true);
      setCouponId(data.id);
    } catch { setCouponError("쿠폰 확인 중 오류가 발생했습니다."); }
  };

  const handlePayment = async () => {
    if (!isLoggedIn) { router.push("/login?redirect=/courses/" + product.slug); return; }
    if (hasPurchased) { router.push("/classroom"); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, couponId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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

  const CTABtn = ({ label, className = "" }: { label?: string; className?: string }) => (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={cn(
        "w-full py-5 rounded-2xl font-black text-white text-lg transition-all active:scale-95 shadow-lg",
        hasPurchased ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600",
        isProcessing && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {isProcessing ? "처리 중..." : hasPurchased ? "강의 바로 듣기 →" : label || "선착순 마감 전에 지금 바로 신청하기 →"}
    </button>
  );

  return (
    <div className="bg-white overflow-x-hidden pb-24">

      {/* ── 1. 상단 긴급 배너 ── */}
      <div className="bg-orange-500 text-white py-4 px-4">
        <p className="text-center font-bold text-sm sm:text-base leading-snug">
          ⚠️ 이 페이지를 나가면, 지금 보고 계신 이 가격으론<br className="sm:hidden" /> 구매할 수 없을 수 있습니다!
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm">
          {["과 기수 가격 상승", "선착순 100명이 마감", "다음 기수는 할인 없이 개강"].map((t, i) => (
            <span key={i} className="flex items-center gap-1"><Check className="w-3 h-3" />{t}</span>
          ))}
        </div>
      </div>

      {/* ── 2. 고민 Pain Points (다크) ── */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-400 text-sm font-bold mb-3">팁스타그램을 찾는 수강생분들의 최소한 문제</p>
          <div className="space-y-3 mb-10">
            {[
              { emoji: "😔", text: "인스타그램을 열심히 하는데 팔로워가 늘지 않아요" },
              { emoji: "😩", text: "콘텐츠를 올려도 반응이 없고 수익으로 연결이 안 돼요" },
              { emoji: "😰", text: "다른 강의를 들었는데도 달라진 게 없어요" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-4 bg-zinc-900 rounded-2xl px-5 py-4">
                <span className="text-2xl shrink-0">{p.emoji}</span>
                <span className="text-sm text-zinc-300 leading-snug">{p.text}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">낮게 구독될수록 더 높은 가격을 지불하게 됩니다</p>
            <p className="text-orange-400 font-bold text-lg">고민하면 시간이 아깝습니다.</p>
            <p className="text-white font-black text-2xl mt-1">오늘이 가장 저렴합니다.</p>
          </div>
        </div>
      </div>

      {/* ── 3. 누군가는 vs 누군가는 (다크) ── */}
      <div className="bg-zinc-900 text-white py-14 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="space-y-3 mb-10">
            <div className="bg-zinc-800 rounded-2xl px-6 py-5">
              <p className="text-zinc-400 text-sm mb-1">누가 구독될 거 동안</p>
              <p className="text-white font-bold">팔리고 매출을 올리고 싶다면</p>
            </div>
            <div className="text-orange-400 font-black text-2xl">↓</div>
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-2xl px-6 py-5">
              <p className="text-orange-300 font-bold">누군가는 어떻게 돈 없이<br />지금 당장 시작할 수 있습니다</p>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
            변화하고 싶다면<br />
            <span className="text-orange-400">저와 함께</span><br />
            성공의 지름길을<br />함께 시작하세요!
          </h2>
          <CTABtn label="선착순 마감 전에 지금 바로 신청하기 →" />
        </div>
      </div>

      {/* ── 4. 영상 후기 ── */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-orange-500 text-sm font-bold mb-2">실제 수강생 영상 후기</p>
          <h2 className="text-center text-2xl sm:text-3xl font-black text-black mb-8 leading-tight">
            직접 경험한 분들의 이야기
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VIDEOS.map((v) => (
              <div key={v.id} className="rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-black relative">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <a
                    href={`https://www.youtube.com/shorts/${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </a>
                </div>
                <div className="px-4 py-3">
                  <p className="font-bold text-sm text-neutral-900">{v.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. 텍스트 후기 ── */}
      <div className="bg-neutral-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-orange-500 text-sm font-bold mb-2">수강생 텍스트 후기</p>
          <h2 className="text-center text-2xl font-black text-black mb-8">팁스타그램으로 변화한 실제 후기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">{r.name[0]}</div>
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{r.name}</p>
                    <p className="text-xs text-neutral-400">{r.tag}</p>
                  </div>
                  <Quote className="w-5 h-5 text-orange-200 ml-auto shrink-0" />
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed mb-3">{r.text}</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold">✓ {r.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. 수강생 미숙님 ── */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-orange-500 text-sm font-bold mb-3">이 위 빙고를 20개에서 70개까지</p>
          <h2 className="text-2xl sm:text-3xl font-black text-black mb-6 leading-tight">
            수강생 미숙님은 현재<br />
            <span className="text-orange-500">4.1만 팔로워</span>입니다
          </h2>
          <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black">미</div>
              <div className="text-left">
                <p className="font-bold text-neutral-900">grace.um_prof</p>
                <p className="text-xs text-neutral-500">팔로워 41,000명</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 text-left border border-neutral-100">
              <p className="text-sm text-neutral-700 leading-relaxed">팁스타그램 수강 전에는 팔로워가 몇백 명 수준이었는데, 강의를 들으면서 꾸준히 콘텐츠를 올렸더니 4만 명을 넘었어요. 그리고 공구를 진행해서 1,800만원의 매출도 달성했습니다!</p>
            </div>
          </div>
          <div className="bg-orange-500 rounded-2xl py-5 px-6 text-white">
            <p className="text-3xl font-black mb-1">팔로워 수 890만 달성!</p>
            <p className="text-sm opacity-80">팁스타그램 수강 후 팔로워 폭발적 증가</p>
          </div>
        </div>
      </div>

      {/* ── 7. 수강생 타입 A/B/C/D ── */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-400 text-sm font-bold mb-3">팁스타그램을 만나 변화를 겪은 수강생은 이 분만이 아닙니다!</p>
          <div className="space-y-4 mb-10">
            {STUDENT_TYPES.map((s, i) => (
              <div key={i} className="flex items-start gap-4 bg-zinc-900 rounded-2xl px-5 py-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">{s.label.replace("수강생 ", "")}</div>
                <div>
                  <p className="font-bold text-orange-400 text-sm">{s.label}</p>
                  <p className="font-black text-white">{s.result}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 text-center mb-6">
            <p className="text-orange-400 font-bold text-sm mb-2">20대부터 70대까지</p>
            <p className="text-white font-black text-xl">나와 상관 없어!</p>
            <p className="text-zinc-400 text-sm mt-2">스포츠, 소일거리, 인테리어, 카페, 다이어트, 홈케어, 뷰티, 육아, 손끄으로, 마루 등 직종 상관 없어</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 font-black text-2xl mb-2">"이제 어러분의 차례입니다"</p>
            <div className="mt-6">
              <CTABtn label="지금 바로 시작하기 →" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. 팁스타그램이 이 모든 걸 ── */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-sm font-bold mb-2">온라인 수익화를 위한 성장 멘토링 강의</p>
            <h2 className="text-3xl font-black text-black leading-tight">
              팁스타그램이<br />
              <span className="text-orange-500">이 모든 걸</span><br />
              더 먹어드립니다!
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { title: "온라인 수익화를 위한 완전 기초부터 고급 전략까지", desc: "성장 멘토링 강의 가이드" },
              { title: "한 번 클릭만으로 무조건 팔로우하게 만드는 프로필과 피드 전략", desc: "사진, 텍스트, 릴스" },
              { title: "높을수록 특유하는 특유하는 폭포하는 특유하는 릴스 제작 방법", desc: "시스템을 따르면 됩니다" },
              { title: "성용를 팔로우하지 않고도 고객이 알아서오고 싶고 싶은 고급 노하우", desc: "인스타그램을 하나로 만들기" },
              { title: "이런 게 강의에 다 담겨있는데 교육비로 지불하지 않으신가요?", desc: "이제 하나로 끝내세요" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. 계속된 실패 ── */}
      <div className="bg-zinc-100 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-neutral-500 text-sm mb-2">계속된 실패..</p>
          <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight mb-6">
            근데 누군가는<br />
            인스타그램 CEO 마저<br />
            계정을 팔로우하고<br />돈을 벌고 있어요?
          </h2>
          <div className="bg-black rounded-2xl p-6 text-white mb-8">
            <p className="text-sm text-zinc-400 mb-4">어떻게 한거지?</p>
            <div className="space-y-3">
              {[
                "인스타그램에 모르는 사람을 모으고",
                "알려짐의 크리에이터의 수강 영향을 분석하고",
                "수강 영상 화면의 모습과 마케팅 지식을 공부했어요",
                "그들의 공통점이 바로 이것"
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-left">
                  <span className="text-orange-400 text-sm shrink-0 mt-0.5">→</span>
                  <span className="text-sm text-zinc-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-lg font-black text-black mb-2">고객 모임부터 판매까지<br /><span className="text-orange-500">계획된 구조</span>가 있단 것!</h3>
        </div>
      </div>

      {/* ── 10. 간판 미로 계단 구조 ── */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-zinc-400 text-sm mb-4">이런 생각 한번쯤 해보셨죠</p>
          <p className="text-white font-black text-xl mb-8">그것이 바로</p>
          <div className="flex justify-center gap-4 mb-8">
            {["간판", "미로", "계단"].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-black text-2xl">{["🏪", "🌀", "🪜"][i]}</span>
                </div>
                <span className="text-white font-black text-lg">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm mb-2">구조</p>
          <p className="text-white text-sm mb-8 leading-relaxed">
            저는 이 구조를 통해<br />
            <span className="text-orange-400 font-bold">2주간 월평균 딱 30명으로</span><br />
            120만원의 수익을<br />달성했습니다
          </p>
          <div className="bg-zinc-900 rounded-2xl p-6 mb-8">
            <p className="text-zinc-400 text-xs mb-2">여기서 나의 데이터를 통해 탄생한 팁스타그램</p>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-xs">tip</span>
            </div>
            <p className="text-white font-black text-xl">tipstagram</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { num: "19만", label: "팔로워 달성" },
              { num: "6천명", label: "수강생 달성" },
              { num: "수백명", label: "한달 달성" },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl py-4 px-2 text-center">
                <p className="text-orange-400 font-black text-xl">{s.num}</p>
                <p className="text-zinc-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 11. 아닙니다! 70대도 됩니다 ── */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-4xl font-black text-black mb-4">아닙니다!</h2>
          <p className="text-neutral-500 text-sm mb-8">팁스타그램 70대 수강생의 이야기를 들려드려요.</p>
          <div className="bg-neutral-50 rounded-2xl p-6 text-left mb-8 border border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black">70</div>
              <div>
                <p className="font-bold text-neutral-900">70대 수강생</p>
                <p className="text-xs text-neutral-500">팁스타그램 수강생</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              &quot;도달이 됐던 것이 지금 지각이 있는 것인가요?&quot; 하고<br />
              나의 처음 질문들이였는데 지금은 다릅니다.<br /><br />
              매일 3일 동안 포스팅하고, 팔로워를 늘리고,<br />수강 후 첫 달에 매출이 생겼습니다!<br /><br />
              예전엔 스마트폰도 잘 못 다뤘는데<br />이제는 릴스도 직접 만들어요.
            </p>
          </div>
          <div className="bg-orange-500 rounded-2xl py-6 px-6 text-white">
            <p className="text-2xl font-black mb-2">어떤 나이도 됩니다!</p>
            <p className="text-sm opacity-80 mb-4">지금 시작하는 당신이 가장 빠릅니다</p>
            <CTABtn label="나도 시작하기 →" className="bg-white !text-orange-500 hover:bg-orange-50 shadow-none" />
          </div>
        </div>
      </div>

      {/* ── 12. 커리큘럼 ── */}
      <div className="bg-neutral-50 py-16 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-500 text-sm font-bold mb-2">강의 커리큘럼</p>
          <h2 className="text-center text-2xl sm:text-3xl font-black text-black mb-8 leading-tight">
            인스타그램 수익화 강의<br />여기서 종결합니다
          </h2>
          <div className="space-y-2 mb-8">
            {CURRICULUM.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">{c.num}</span>
                  <span className="font-bold text-neutral-900 flex-1 text-sm">{c.label}</span>
                  {openIdx === i ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-4 space-y-2">
                    {c.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2.5 text-sm text-neutral-600">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <CTABtn label="지금 바로 수강 신청하기 →" />
        </div>
      </div>

      {/* ── 13. 비교 표 ── */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-500 text-sm font-bold mb-2">비교해보세요</p>
          <h2 className="text-center text-2xl font-black text-black mb-8">
            다른 강의와 비교하지 마세요!<br />
            <span className="text-orange-500">비교 자체가 불가한 수준</span>
          </h2>
          <div className="rounded-2xl overflow-hidden border border-neutral-200">
            <div className="grid grid-cols-3 bg-neutral-100 py-3">
              <div className="text-center text-xs font-bold text-neutral-500">항목</div>
              <div className="text-center text-xs font-bold text-neutral-500">타사 인스타 강의</div>
              <div className="text-center text-xs font-bold text-orange-600">팁스타그램 ✓</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={cn("grid grid-cols-3 py-3.5 border-t border-neutral-100", i % 2 === 0 ? "bg-white" : "bg-neutral-50")}>
                <div className="text-center text-xs text-neutral-700 font-medium px-2">{row.label}</div>
                <div className="text-center text-red-400 font-bold">✕</div>
                <div className="text-center text-orange-500 font-bold">✓</div>
              </div>
            ))}
          </div>

          {/* 가격 비교 */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-neutral-100 rounded-2xl p-5 text-center">
              <p className="text-xs text-neutral-500 mb-2">타사 인스타 강의</p>
              <p className="text-2xl font-black text-neutral-400 line-through">월 수십만원</p>
              <p className="text-xs text-neutral-400 mt-1">Q&A 없음 · 커뮤니티 없음</p>
            </div>
            <div className="bg-orange-500 rounded-2xl p-5 text-center">
              <p className="text-xs text-orange-200 mb-2">팁스타그램</p>
              <p className="text-2xl font-black text-white">월 3,300원</p>
              <p className="text-xs text-orange-100 mt-1">무제한 Q&A · 커뮤니티 포함</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 14. 가격 & 결제 ── */}
      <div className="bg-black text-white py-16 px-4" id="pricing">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-400 text-sm font-bold mb-2">지금 이 가격, 마지막 기회!</p>
          <h2 className="text-center text-3xl font-black mb-8">지금 놓치면 다됩니다<br />이 혜택에도 금지도 큰 절호의 기회</h2>

          <div className="bg-zinc-900 rounded-3xl p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-zinc-400 text-sm mb-1">선착순 한정가</p>
              <div className="text-5xl font-black text-white mb-1">{formatPrice(finalPrice)}</div>
              {discount > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-zinc-500 line-through text-lg">{formatPrice(product.price)}</span>
                  <span className="text-orange-400 text-sm font-bold">- {formatPrice(discount)} 할인</span>
                </div>
              )}
              <p className="text-zinc-500 text-xs mt-2">VAT 포함 · 평생 수강 가능</p>
            </div>

            {/* 쿠폰 */}
            {!hasPurchased && (
              <div className="mb-5">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="쿠폰 코드 입력"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                      className="w-full pl-9 pr-3 py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode || couponApplied}
                    className="px-4 py-3 text-sm font-bold rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50 transition-colors"
                  >
                    {couponApplied ? "적용됨" : "적용"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-400 mt-1.5">{couponError}</p>}
                {couponApplied && <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" /> 쿠폰이 적용되었습니다</p>}
              </div>
            )}

            <CTABtn label={`${formatPrice(finalPrice)}로 지금 수강 신청하기 →`} />

            <ul className="mt-5 space-y-2">
              {["평생 수강 가능", "모바일 / PC 모두 지원", "수료증 발급", "무제한 Q&A 포함", "수강생 커뮤니티 참여"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="w-4 h-4 text-orange-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── 15. 시크릿 혜택 12가지 ── */}
      <div className="bg-neutral-50 py-16 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-orange-500 text-sm font-bold mb-2">수강생에게만 제공하는</p>
          <h2 className="text-center text-2xl font-black text-black mb-8">시크릿 혜택 12가지</h2>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-4 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="font-bold text-sm text-neutral-900 mb-1">{b.title}</p>
                <p className="text-xs text-neutral-400 leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 16. 타사 강의 비교 ── */}
      <div className="bg-orange-500 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            다른 강의와<br />비교하지 마세요!<br />
            비교 자체가 불가한 수준
          </h2>
          <p className="text-orange-100 text-sm mb-8">팁스타그램 커리큘럼을 마케팅 부스터로<br />비교 자체가 불가능한 강의를 경험하세요</p>
          <div className="bg-white rounded-3xl p-6">
            <div className="text-left space-y-3 mb-6">
              {[
                "팔로워 없어도 수익 내는 법",
                "인스타로 첫 고객 만드는 법",
                "자동화로 매일 팔리는 시스템",
                "수강 강의 전 내 Q&A 답변",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-neutral-800">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" /> {t}
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-400 mb-1">선착순 한정가</p>
              <p className="text-3xl font-black text-black mb-3">{formatPrice(finalPrice)}</p>
              <CTABtn label="→ 지금 한 번 구입하기" className="!text-base !py-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 17. 최종 CTA ── */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-orange-400 text-sm font-bold mb-4">지금 놓치면 다됩니다</p>
          <h2 className="text-4xl font-black leading-tight mb-6">
            지금 이 가격,<br />
            <span className="text-orange-400">마지막 기회!</span>
          </h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            선착순 수강생 할인이 마감되면<br />
            이 가격으로 다시는 구매할 수 없습니다.<br />
            지금 바로 시작하세요.
          </p>
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm mb-1">현재 적용 가격</p>
            <p className="text-4xl font-black text-white mb-1">{formatPrice(finalPrice)}</p>
            {discount > 0 && (
              <p className="text-zinc-500 line-through text-lg mb-4">{formatPrice(product.price)}</p>
            )}
            <CTABtn label={`지금 ${formatPrice(finalPrice)}로 수강 신청하기 →`} className="!text-base" />
            <p className="text-zinc-500 text-xs mt-3">✓ 평생 수강 · ✓ 환불 가능 · ✓ 모바일/PC</p>
          </div>
        </div>
      </div>

      {/* ── 하단 고정 결제 버튼 ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-2xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-xl font-black text-black leading-none">{formatPrice(finalPrice)}</p>
            {discount > 0 && <p className="text-xs text-zinc-400 line-through">{formatPrice(product.price)}</p>}
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={cn(
              "flex-1 py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-95",
              hasPurchased ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600",
              isProcessing && "opacity-60"
            )}
          >
            {isProcessing ? "처리 중..." : hasPurchased ? "강의 바로 듣기" : "지금 바로 신청하기 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
