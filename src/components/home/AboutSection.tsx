interface StatItem { value: string; label: string; }
interface PainPoint { emoji: string; title: string; desc: string; }
interface Solution { num: string; title: string; desc: string; }

const defaultStats: StatItem[] = [
  { value: "1,200+", label: "누적 수강생" },
  { value: "98%", label: "수강 만족도" },
  { value: "94%", label: "수료율" },
  { value: "4.9점", label: "평균 평점" },
];

const defaultPainPoints: PainPoint[] = [
  { emoji: "😔", title: "아무리 올려도 팔로워가 늘지 않아요", desc: "매일 콘텐츠를 올리는데 반응도 없고 팔로워도 그대로예요." },
  { emoji: "🤯", title: "어떤 콘텐츠를 올려야 할지 모르겠어요", desc: "기획부터 막막하고, 뭘 올려야 사람들이 반응하는지 감이 없어요." },
  { emoji: "📉", title: "광고 없이는 노출이 안 되는 것 같아요", desc: "인스타 알고리즘이 너무 어렵게 느껴져요. 유료 광고 없이는 도저히 안 될 것 같아요." },
  { emoji: "💸", title: "인스타로 어떻게 수익을 내는지 모르겠어요", desc: "팔로워가 있어도 어떻게 돈을 버는 건지, 수익화 방법이 막연해요." },
];

const defaultSolutions: Solution[] = [
  { num: "01", title: "실전 중심 커리큘럼", desc: "이론 없이 현업에서 바로 써먹을 수 있는 노하우만 담았습니다. 수강 즉시 내 계정에 적용 가능합니다." },
  { num: "02", title: "현업 전문가 강사진", desc: "팔로워 수십만을 달성한 실제 SNS 전문가가 직접 가르칩니다. 검증된 방법만 알려드립니다." },
  { num: "03", title: "20일 챌린지로 습관 형성", desc: "배운 내용을 20일 챌린지로 직접 실천합니다. 하루하루 실행하며 눈에 띄는 변화를 경험하세요." },
  { num: "04", title: "함께 성장하는 커뮤니티", desc: "전용 오픈채팅방에서 동료들과 함께 성장합니다. 질문은 언제든지, 서로 동기부여하며 나아가요." },
];

interface Props {
  stats?: StatItem[];
  painPoints?: PainPoint[];
  solutions?: Solution[];
}

export function AboutSection({ stats = defaultStats, painPoints = defaultPainPoints, solutions = defaultSolutions }: Props) {
  return (
    <>
      {/* Stats bar */}
      <section className="py-14 px-4 sm:px-6 border-b border-neutral-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-black ig-gradient-text tracking-tight">{value}</div>
                <div className="text-sm text-neutral-500 mt-1.5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-24 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-500 text-sm font-semibold mb-5">
              혹시 이런 고민이 있으신가요?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              인스타그램, 열심히 하는데
              <br />
              <span className="ig-gradient-text">왜 나만 안 될까요?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {painPoints.map((p) => (
              <div key={p.title} className="flex gap-4 p-6 bg-white rounded-2xl border border-neutral-100 hover:border-pink-200 hover:shadow-sm transition-all">
                <div className="text-3xl shrink-0">{p.emoji}</div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1.5">{p.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-neutral-500 text-lg font-medium">이 고민들, 사실 방법을 몰라서 생기는 거예요.</p>
            <p className="text-neutral-900 text-xl font-black mt-2">팁스타그램에서 제대로 된 방법을 알려드립니다.</p>
          </div>
        </div>
      </section>

      {/* Solution section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-5">팁스타그램 소개</span>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                배움이 바로<br /><span className="ig-gradient-text">결과로 이어집니다</span>
              </h2>
              <p className="mt-6 text-neutral-600 leading-relaxed text-base">
                팁스타그램은 '팁(Tip)'과 '인스타그램(Instagram)'의 합성어로, 현업 전문가들의 핵심 노하우를 가장 빠르게 전달하는 플랫폼입니다.
              </p>
              <p className="mt-4 text-neutral-600 leading-relaxed text-base">
                불필요한 이론 없이, 수강 즉시 내 계정에 적용 가능한 실전 노하우로 당신의 성장을 가속화합니다.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                <a href="/courses">강의 시작하기 →</a>
              </div>
            </div>

            <div className="space-y-4">
              {solutions.map((s) => (
                <div key={s.num} className="flex gap-5 p-6 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors group">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-xl ig-gradient flex items-center justify-center">
                      <span className="text-white text-xs font-black">{s.num}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base mb-1.5 group-hover:text-pink-600 transition-colors">{s.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
