"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Users, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  buttonText?: string | null;
  bgColor?: string | null;
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    title: "인스타그램으로\n나만의 브랜드를\n만드세요",
    subtitle: "팔로워 0에서 시작해도 됩니다. 현업 전문가의 검증된 노하우로 당신의 SNS를 성장시키세요.",
    image: null,
    link: "/courses",
    buttonText: "지금 시작하기",
    bgColor: null,
  },
];

export function HeroSlider({ slides = defaultSlides }: { slides?: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next, slides.length]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {s.image ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.image})` }} />
              <div className="absolute inset-0 bg-black/60" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#080808]" />
              <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
              <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
              <div className="absolute bottom-20 left-1/4 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />
              <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
            </>
          )}
        </div>
      ))}

      <div className="relative flex-1 flex items-center justify-center text-center px-6 pt-28 pb-36">
        <div className="max-w-4xl w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            지금 바로 수강 신청 가능
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            {slide.title.split("\n").map((line, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? <span className="ig-gradient-text">{line}</span> : line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {slide.subtitle && (
            <p className="mt-7 text-lg sm:text-xl text-white/60 font-medium max-w-xl mx-auto leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {slide.link && slide.buttonText && (
              <Link href={slide.link} className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl font-bold text-base text-white ig-gradient hover:opacity-90 transition-opacity shadow-2xl shadow-pink-900/40">
                {slide.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            <Link href="/courses" className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 rounded-2xl font-bold text-base text-white border border-white/20 hover:bg-white/10 transition-colors">
              강의 둘러보기
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="text-white/60 text-sm"><strong className="text-white">4.9</strong>점 만족도</span>
            </div>
            <div className="w-px h-5 bg-white/15 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Users className="w-4 h-4 text-white/40" />
              <span>누적 수강생 <strong className="text-white">1,200+</strong>명</span>
            </div>
            <div className="w-px h-5 bg-white/15 hidden sm:block" />
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <span>수료율 <strong className="text-white">94%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} className={cn("transition-all duration-300 rounded-full", idx === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/50")} />
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 72L1440 72L1440 36C1200 72 960 0 720 36C480 72 240 0 0 36L0 72Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
