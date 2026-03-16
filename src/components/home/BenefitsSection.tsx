import Link from "next/link";

interface BenefitItem { icon: string; title: string; desc: string; }

const defaultBenefits: BenefitItem[] = [
  { icon: "🎬", title: "VOD 강의 무제한 시청", desc: "구매 후 4개월간 언제 어디서든 강의를 반복 시청할 수 있습니다. 새 업데이트 강의는 수강생에게 무료로 제공됩니다." },
  { icon: "💬", title: "수강생 전용 오픈채팅방", desc: "강의가 끝나도 질문은 계속할 수 있습니다. 수강생 전용 카카오 오픈채팅방에서 언제든지 궁금한 점을 물어보세요." },
  { icon: "🎉", title: "온·오프라인 이벤트 우선 참여", desc: "커뮤니티 내에서 진행되는 다양한 온라인 및 오프라인 이벤트에 우선적으로 참여할 수 있는 혜택을 드립니다." },
  { icon: "🔥", title: "20일 챌린지 참여 기회", desc: "매달 첫째 주부터 셋째 주까지 진행되는 20일 챌린지에 참여해 배운 내용을 실전으로 연습하세요." },
  { icon: "📡", title: "라이브 강의 참여", desc: "매주 챕터 주별로 일요일 수강생 전용 라이브를 진행합니다. 실시간으로 강사와 소통하며 배울 수 있습니다." },
  { icon: "🏅", title: "수료증 발급", desc: "챌린지를 완수한 수강생에게는 수료증을 발급해 드립니다. 포트폴리오에 활용하실 수 있습니다." },
];

export function BenefitsSection({ benefits = defaultBenefits }: { benefits?: BenefitItem[] }) {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-5">수강 혜택</span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
            수강하면 이런 혜택이<br /><span className="ig-gradient-text">모두 포함됩니다</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 rounded-2xl border border-neutral-100 hover:border-pink-200 hover:shadow-md transition-all duration-200 bg-white group">
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-pink-600 transition-colors">{b.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-3xl ig-gradient p-px">
          <div className="rounded-3xl bg-[#080808] px-8 py-10 sm:px-14 sm:py-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              지금 수강 신청하고<br /><span className="ig-gradient-text">이 모든 혜택을 누리세요</span>
            </h3>
            <p className="mt-4 text-white/60 text-base">수강생 1,200명이 선택한 팁스타그램과 함께 시작하세요</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl ig-gradient text-white font-bold text-base hover:opacity-90 transition-opacity">
                강의 신청하기 →
              </Link>
              <Link href="/courses" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-base hover:bg-white/10 transition-colors">
                강의 목록 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
