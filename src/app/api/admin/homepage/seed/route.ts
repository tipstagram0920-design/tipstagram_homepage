import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaults: { section: string; data: object }[] = [
  // stats
  { section: "stats", data: { value: "1,200+", label: "누적 수강생" } },
  { section: "stats", data: { value: "98%", label: "수강 만족도" } },
  { section: "stats", data: { value: "94%", label: "수료율" } },
  { section: "stats", data: { value: "4.9점", label: "평균 평점" } },
  // pain_points
  { section: "pain_points", data: { emoji: "😔", title: "아무리 올려도 팔로워가 늘지 않아요", desc: "매일 콘텐츠를 올리는데 반응도 없고 팔로워도 그대로예요." } },
  { section: "pain_points", data: { emoji: "🤯", title: "어떤 콘텐츠를 올려야 할지 모르겠어요", desc: "기획부터 막막하고, 뭘 올려야 사람들이 반응하는지 감이 없어요." } },
  { section: "pain_points", data: { emoji: "📉", title: "광고 없이는 노출이 안 되는 것 같아요", desc: "인스타 알고리즘이 너무 어렵게 느껴져요. 유료 광고 없이는 도저히 안 될 것 같아요." } },
  { section: "pain_points", data: { emoji: "💸", title: "인스타로 어떻게 수익을 내는지 모르겠어요", desc: "팔로워가 있어도 어떻게 돈을 버는 건지, 수익화 방법이 막연해요." } },
  // solutions
  { section: "solutions", data: { num: "01", title: "실전 중심 커리큘럼", desc: "이론 없이 현업에서 바로 써먹을 수 있는 노하우만 담았습니다. 수강 즉시 내 계정에 적용 가능합니다." } },
  { section: "solutions", data: { num: "02", title: "현업 전문가 강사진", desc: "팔로워 수십만을 달성한 실제 SNS 전문가가 직접 가르칩니다. 검증된 방법만 알려드립니다." } },
  { section: "solutions", data: { num: "03", title: "20일 챌린지로 습관 형성", desc: "배운 내용을 20일 챌린지로 직접 실천합니다. 하루하루 실행하며 눈에 띄는 변화를 경험하세요." } },
  { section: "solutions", data: { num: "04", title: "함께 성장하는 커뮤니티", desc: "전용 오픈채팅방에서 동료들과 함께 성장합니다. 질문은 언제든지, 서로 동기부여하며 나아가요." } },
  // benefits
  { section: "benefits", data: { icon: "🎬", title: "VOD 강의 무제한 시청", desc: "구매 후 4개월간 언제 어디서든 강의를 반복 시청할 수 있습니다." } },
  { section: "benefits", data: { icon: "💬", title: "수강생 전용 오픈채팅방", desc: "강의가 끝나도 수강생 전용 카카오 오픈채팅방에서 언제든지 질문하세요." } },
  { section: "benefits", data: { icon: "🎉", title: "온·오프라인 이벤트 우선 참여", desc: "커뮤니티에서 진행되는 다양한 이벤트에 우선적으로 참여할 수 있습니다." } },
  { section: "benefits", data: { icon: "🔥", title: "20일 챌린지 참여 기회", desc: "매달 진행되는 20일 챌린지에 참여해 배운 내용을 실전으로 연습하세요." } },
  { section: "benefits", data: { icon: "📡", title: "라이브 강의 참여", desc: "매주 일요일 수강생 전용 라이브를 진행합니다." } },
  { section: "benefits", data: { icon: "🏅", title: "수료증 발급", desc: "챌린지를 완수한 수강생에게 수료증을 발급해 드립니다." } },
  // faq
  { section: "faq", data: { q: "인스타그램을 잘 모르는데 괜찮을까요?", a: "네! 왕초보를 위해 입문부터 꼼꼼하게 준비했습니다." } },
  { section: "faq", data: { q: "수강 후 즉시 적용 가능할까요?", a: "네! 실전 내용이라 수강 후 바로 내 계정에 적용하실 수 있습니다." } },
  { section: "faq", data: { q: "수업이 끝나도 질문을 할 수 있을까요?", a: "수강생 카톡방을 통해 궁금한 점은 언제든지 여쭤보세요!" } },
  { section: "faq", data: { q: "VOD 강의의 영구 소장이 가능한가요?", a: "VOD 강의의 유효 기간은 개강일 기준 4개월입니다. 새 업데이트 시 수강생에게 새 링크를 제공합니다." } },
  { section: "faq", data: { q: "VOD 강의는 언제부터 시청 가능한가요?", a: "구매 후 바로 시청 가능합니다. 수강 기간은 4개월입니다." } },
  { section: "faq", data: { q: "수강 신청 후 어떻게 하나요?", a: "① 안내 메일 확인 → ② 수강생 카톡방 입장 → ③ VOD 강의 수강 → ④ 라이브 참여 → ⑤ 20일 챌린지 참여" } },
  // videos
  { section: "videos", data: { youtubeId: "dQw4w9WgXcQ", name: "김○○ 수강생", desc: "팔로워 300 → 5,000명 달성 후기" } },
  { section: "videos", data: { youtubeId: "dQw4w9WgXcQ", name: "박○○ 수강생", desc: "수강 후 첫 클라이언트 계약 후기" } },
  { section: "videos", data: { youtubeId: "dQw4w9WgXcQ", name: "이○○ 수강생", desc: "소상공인 광고 없이 매출 상승 후기" } },
  // reviews
  { section: "reviews", data: { name: "김○○", tag: "@kim_insta_life", rating: 5, text: "수강 전에는 팔로워가 300명이었는데, 3개월 만에 5,000명을 넘었어요.", highlight: "3개월 만에 5,000명 달성" } },
  { section: "reviews", data: { name: "박○○", tag: "@park_brand_studio", rating: 5, text: "인스타로 어떻게 수익을 내야 하는지 막막했는데, DM 문의가 오기 시작했어요.", highlight: "수강 후 첫 클라이언트 계약" } },
  { section: "reviews", data: { name: "이○○", tag: "@lee_daily_tips", rating: 5, text: "완전 입문자인 제가 이해하기 너무 쉽게 설명해 주셔서 좋았어요. 알고리즘도 이제 이해해요!", highlight: "입문자도 쉽게 이해" } },
  { section: "reviews", data: { name: "정○○", tag: "@jeong_creator", rating: 5, text: "릴스 조회수가 10배 이상 올랐습니다. 가격도 합리적이고 내용 밀도가 훨씬 높아요.", highlight: "릴스 조회수 10배 상승" } },
  { section: "reviews", data: { name: "최○○", tag: "@choi_small_biz", rating: 5, text: "광고비 없이도 손님이 늘어났어요. 매장 매출도 올랐습니다.", highlight: "광고 없이 매출 상승" } },
  { section: "reviews", data: { name: "윤○○", tag: "@yoon_lifestyle", rating: 5, text: "오픈채팅방에서 빠르게 답변해 주셔서 정말 좋았어요. 계속 지원받는 느낌이에요.", highlight: "끊임없는 커뮤니티 지원" } },
];

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.homepageBlock.count();
  if (existing > 0) return NextResponse.json({ message: "Already seeded" });

  const sections = [...new Set(defaults.map(d => d.section))];
  for (const section of sections) {
    const items = defaults.filter(d => d.section === section);
    await prisma.homepageBlock.createMany({
      data: items.map((item, order) => ({
        section: item.section,
        order,
        data: JSON.stringify(item.data),
        isActive: true,
      })),
    });
  }
  return NextResponse.json({ ok: true, count: defaults.length });
}
