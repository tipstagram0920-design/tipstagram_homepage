"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Star, Quote, Play } from "lucide-react";

interface VideoItem { youtubeId: string; name: string; desc: string; }
interface ReviewItem { name: string; tag: string; rating: number; text: string; highlight: string; }

const defaultVideos: VideoItem[] = [
  { youtubeId: "dQw4w9WgXcQ", name: "김○○ 수강생", desc: "팔로워 300 → 5,000명 달성 후기" },
  { youtubeId: "dQw4w9WgXcQ", name: "박○○ 수강생", desc: "수강 후 첫 클라이언트 계약 후기" },
  { youtubeId: "dQw4w9WgXcQ", name: "이○○ 수강생", desc: "소상공인 광고 없이 매출 상승 후기" },
];

const defaultReviews: ReviewItem[] = [
  { name: "김○○", tag: "@kim_insta_life", rating: 5, text: "수강 전에는 팔로워가 300명이었는데, 3개월 만에 5,000명을 넘었어요. 강의 내용이 정말 실전적이라 배운 걸 바로 써먹을 수 있었습니다.", highlight: "3개월 만에 5,000명 달성" },
  { name: "박○○", tag: "@park_brand_studio", rating: 5, text: "인스타로 어떻게 수익을 내야 하는지 막막했는데, 팁스타그램 강의를 듣고 나서 실제로 DM 문의가 오기 시작했어요.", highlight: "수강 후 첫 클라이언트 계약" },
  { name: "이○○", tag: "@lee_daily_tips", rating: 5, text: "완전 입문자인 제가 이해하기 너무 쉽게 설명해 주셔서 좋았어요. 20일 챌린지 덕분에 꾸준히 올리는 습관도 생겼고, 알고리즘도 이제 이해해요!", highlight: "입문자도 쉽게 이해" },
  { name: "정○○", tag: "@jeong_creator", rating: 5, text: "다른 강의들이랑 비교하면 가격도 합리적이고 내용 밀도가 훨씬 높아요. 강의 수강하고 릴스 조회수가 10배 이상 올랐습니다.", highlight: "릴스 조회수 10배 상승" },
  { name: "최○○", tag: "@choi_small_biz", rating: 5, text: "소상공인인데 인스타 마케팅을 직접 해보고 싶어서 수강했어요. 광고비 없이도 손님이 늘어났어요.", highlight: "광고 없이 매출 상승" },
  { name: "윤○○", tag: "@yoon_lifestyle", rating: 5, text: "오픈채팅방에서 궁금한 점을 물어보면 빠르게 답변해 주셔서 정말 좋았어요. 계속 지원받는 느낌이에요.", highlight: "끊임없는 커뮤니티 지원" },
];

function VideoCard({ youtubeId: rawId, name, desc }: VideoItem) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: false });
  const [playing, setPlaying] = useState(false);

  // URL에서 11자리 ID만 추출하는 로직 추가
  const youtubeId = (() => {
    const match = rawId.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : rawId.trim();
  })();

  if (inView && !playing) setPlaying(true);
  if (!inView && playing) setPlaying(false);

  const src = playing
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`
    : `https://www.youtube.com/embed/${youtubeId}?controls=1&modestbranding=1&rel=0`;

  return (
    <div ref={ref} className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative aspect-video bg-neutral-900">
        {playing ? (
          <iframe src={src} title={name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer group" onClick={() => setPlaying(true)}>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              onError={e => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('maxresdefault')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                } else if (target.src.includes('hqdefault')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`;
                } else {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
                }
              }}
            />
            <div className="relative z-10 w-16 h-16 rounded-full ig-gradient flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        <p className="font-bold text-neutral-900 text-sm">{name}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

interface Props { videos?: VideoItem[]; reviews?: ReviewItem[]; }

export function InterviewSection({ videos = defaultVideos, reviews = defaultReviews }: Props) {
  return (
    <section className="py-24 px-4 sm:px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 text-sm font-semibold mb-5">실제 수강생 후기</span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">직접 경험한 분들의 이야기</h2>
          <p className="mt-4 text-neutral-500 text-base max-w-md mx-auto">팁스타그램으로 실제 변화를 경험한 수강생들의 생생한 후기를 확인하세요</p>
        </div>

        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {videos.map((v, i) => <VideoCard key={i} {...v} />)}
          </div>
        )}

        {videos.length > 0 && reviews.length > 0 && (
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-sm text-neutral-400 font-medium shrink-0">텍스트 후기</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
        )}

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full ig-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">{r.name[0]}</div>
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">{r.name}</p>
                      <p className="text-xs text-neutral-400">{r.tag}</p>
                    </div>
                  </div>
                  <Quote className="w-5 h-5 text-pink-200 shrink-0" />
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">{r.text}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">✓ {r.highlight}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm mb-4">나도 이런 변화를 경험하고 싶다면?</p>
          <a href="/courses" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity">수강 신청하기 →</a>
        </div>
      </div>
    </section>
  );
}
