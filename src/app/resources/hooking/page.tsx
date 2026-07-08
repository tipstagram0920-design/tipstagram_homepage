import type { Metadata } from "next";
import { ResourceLayout, ResourceCard } from "../ResourceLayout";

export const metadata: Metadata = {
  title: "50만+ 인스타 후킹 패턴 50선 | 팁스타그램",
  description: "릴스·게시물 초반 3초에 시선을 붙잡는 후킹 문장 50개를 카테고리별로 정리한 자료입니다.",
  robots: { index: false, follow: false },
};

type Pattern = { hook: string; note?: string };
type Category = { name: string; desc: string; items: Pattern[] };

const CATEGORIES: Category[] = [
  {
    name: "숫자·구체 수치",
    desc: "구체적인 숫자는 &quot;이건 검증된 이야기&quot; 신호를 줍니다.",
    items: [
      { hook: "3개월 만에 팔로워 12만이 붙은 이유" },
      { hook: "돈 안 쓰고 100일 만에 매출 500 만든 방법" },
      { hook: "인스타로 월 1,000 넘게 만든 사람들 딱 3가지 공통점" },
      { hook: "1분만 보세요, 팔로워 1만 명이 왜 안 늘던지" },
      { hook: "5년 동안 인스타 하면서 절대 안 하는 3가지" },
    ],
  },
  {
    name: "지식·정보 제공",
    desc: "&quot;저장하고 싶다&quot; 감정을 자극합니다.",
    items: [
      { hook: "저장 필수 · 인스타 알고리즘 2026 최신 정리" },
      { hook: "릴스 조회수 1만 넘기는 3초 후킹 공식" },
      { hook: "인스타 프로필 · 이 한 줄만 바꿔도 팔로우가 3배" },
      { hook: "판매 잘 되는 사람들 인스타 스토리 순서" },
      { hook: "안 팔리는 계정에서 공통으로 빠진 것 하나" },
    ],
  },
  {
    name: "공포·후회",
    desc: "&quot;이걸 놓치면 나만 손해&quot; 감정을 자극합니다.",
    items: [
      { hook: "인스타 하다가 이걸 놓친 사람이 90%" },
      { hook: "팔로워 1만인데 매출이 안 나는 진짜 이유" },
      { hook: "이 실수하면 알고리즘이 계정을 죽여요" },
      { hook: "인스타 하면서 절대 하면 안 되는 3가지" },
      { hook: "1년 동안 매일 올렸는데 안 크는 계정의 공통점" },
    ],
  },
  {
    name: "궁금증·미공개",
    desc: "&quot;내가 몰랐던 게 있다&quot;는 궁금증을 유발합니다.",
    items: [
      { hook: "인스타 담당자한테 직접 들은 이야기" },
      { hook: "이건 컨설팅 유료 회원한테만 알려줬던 방법" },
      { hook: "다들 몰래 쓰는 인스타 성장 도구 3개" },
      { hook: "이번에 처음 공개하는 콘텐츠 기획법" },
      { hook: "저도 이건 최근에야 알았어요" },
    ],
  },
  {
    name: "비유·이미지",
    desc: "익숙한 것에 빗대면 이해 속도가 배 이상 빨라집니다.",
    items: [
      { hook: "인스타 계정은 '가게'예요. 문 앞이 프로필이고..." },
      { hook: "팔로워 1만은 &quot;문 앞을 지나가는 사람&quot; 숫자일 뿐이에요" },
      { hook: "인스타 세일즈는 계단이에요. 한 번에 두 칸 못 올라요" },
      { hook: "릴스는 &quot;영화 예고편&quot;처럼 만들어야 조회수 나와요" },
      { hook: "스토리는 &quot;친한 친구 카톡&quot;처럼 써야 팬이 생겨요" },
    ],
  },
  {
    name: "반전·역발상",
    desc: "&quot;당연한 통념&quot;을 뒤집으면 시선이 멈춥니다.",
    items: [
      { hook: "팔로워 늘리려고 콘텐츠 늘리면 오히려 안 커요" },
      { hook: "인스타 매일 안 올려도 매출은 나올 수 있어요" },
      { hook: "해시태그 30개 다 채우는 게 오히려 손해" },
      { hook: "팔로워 많다고 매출 많은 거 아니에요" },
      { hook: "&quot;저품질 계정&quot;도 매출은 잘 나오더라고요" },
    ],
  },
  {
    name: "리스트·순위",
    desc: "&quot;끝까지 봐야 하는 이유&quot;를 자동으로 만듭니다.",
    items: [
      { hook: "돈 잘 버는 인스타 계정 3가지 유형" },
      { hook: "인스타 시작하면 꼭 세팅해야 할 5가지" },
      { hook: "릴스 조회수 폭발 시키는 5가지 패턴" },
      { hook: "인스타에서 사람들을 팬으로 만드는 4단계" },
      { hook: "안 팔리는 프로필의 특징 6가지" },
    ],
  },
  {
    name: "개인 서사",
    desc: "&quot;진짜 사람 이야기&quot;는 알고리즘도 좋아합니다.",
    items: [
      { hook: "직장 다니면서 인스타로 월 500 만든 방법" },
      { hook: "5년 동안 실패하고 알아낸 인스타의 진짜 축" },
      { hook: "팔로워 100명이었을 때 매일 했던 것" },
      { hook: "인스타로 인생이 바뀐 이야기, 3분만 들어주세요" },
      { hook: "빚 갚으려고 인스타 시작한 사람의 첫 30일" },
    ],
  },
  {
    name: "비교·대비",
    desc: "&quot;A vs B&quot; 구도는 클릭률이 압도적입니다.",
    items: [
      { hook: "잘 되는 계정 vs 안 되는 계정 · 차이 딱 하나" },
      { hook: "1만 팔로워 계정 vs 10만 팔로워 계정, 다른 점 3가지" },
      { hook: "월 100 계정 vs 월 1,000 계정의 콘텐츠 차이" },
      { hook: "예전의 인스타 vs 지금의 인스타" },
      { hook: "&quot;열심히&quot; 하는 계정 vs &quot;방향&quot; 있는 계정" },
    ],
  },
  {
    name: "직접 질문·명령",
    desc: "시청자에게 직접 말하면 3초 이탈이 확 줄어듭니다.",
    items: [
      { hook: "인스타 시작한 지 3개월 됐다면 이거 꼭 보세요" },
      { hook: "지금 계정 팔로워 3천 미만이라면 이 순서로 하세요" },
      { hook: "잠깐 스크롤 멈춰주세요. 이건 진짜예요" },
      { hook: "이 릴스는 판매하는 사람만 보세요" },
      { hook: "인스타로 사업하실 거면 이 3가지부터 세팅하세요" },
    ],
  },
];

export default function HookingPage() {
  let count = 0;
  return (
    <ResourceLayout
      eyebrow="HOOKING PATTERNS · 50"
      title="50만+ 인스타 후킹 패턴 50선"
      subtitle="릴스·게시물·스토리 초반 3초에 시선을 붙잡는 후킹 문장 50개. 그대로 써도 좋고, 내 주제에 맞게 변형해서 쓰세요."
    >
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold text-neutral-500">사용법</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] text-neutral-700">
          <li>오늘 만들 릴스·게시물의 주제를 한 줄로 씁니다.</li>
          <li>10개 카테고리 중 &quot;그 주제와 가장 어울리는 3개&quot;를 골라요.</li>
          <li>각 카테고리에서 1문장씩, 총 3개의 후킹을 뽑습니다.</li>
          <li>실제로 소리 내 읽어보고 가장 자연스러운 걸 선택합니다.</li>
        </ol>
      </div>

      {CATEGORIES.map((cat) => {
        const startNum = count + 1;
        count += cat.items.length;
        return (
          <ResourceCard
            key={cat.name}
            index={`${String(startNum).padStart(2, "0")}~${String(count).padStart(2, "0")}`}
            title={cat.name}
          >
            <p className="text-sm text-neutral-500" dangerouslySetInnerHTML={{ __html: cat.desc }} />
            <ul className="mt-3 space-y-2">
              {cat.items.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-neutral-100 px-1.5 text-[11px] font-bold text-neutral-500 tabular-nums">
                    {String(startNum + i).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] text-neutral-800">{p.hook}</span>
                </li>
              ))}
            </ul>
          </ResourceCard>
        );
      })}

      <div className="rounded-2xl ig-gradient p-6 text-white sm:p-8">
        <p className="text-sm font-bold tracking-wide">한 걸음 더</p>
        <p className="mt-2 text-lg font-black leading-snug">
          10개 카테고리 × 5문장 = 50개.<br />
          이 중 3개만 매일 써도 30일이면 90개 릴스가 나옵니다.
        </p>
        <p className="mt-2 text-sm text-white/90">
          핵심은 후킹 &quot;문장&quot;이 아니라, 그 뒤에 오는 콘텐츠가 후킹의 약속을 지키는지입니다.
        </p>
      </div>
    </ResourceLayout>
  );
}
