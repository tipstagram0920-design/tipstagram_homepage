import type { Metadata } from "next";
import { ResourceLayout, ResourceCard } from "../ResourceLayout";

export const metadata: Metadata = {
  title: "인스타그램 자주 묻는 질문 10 | 팁스타그램",
  description: "팁스타그램 수강생·라이브 참여자에게 가장 많이 받는 질문 10개를 정리한 답변집입니다.",
  robots: { index: false, follow: false },
};

export default function FaqPage() {
  return (
    <ResourceLayout
      eyebrow="INSTAGRAM FAQ · TOP 10"
      title="인스타그램 자주 묻는 질문 10"
      subtitle="라이브·컨설팅·DM에서 반복해서 받는 질문 10개를 한 번에 정리했어요. 오늘 결정에 참고하세요."
    >
      <ResourceCard index="Q1" title="팔로워 몇 명부터 매출이 나오나요?">
        <p>
          숫자보다 <strong>&quot;프로필-피드-DM&quot;의 일관성</strong>이 먼저입니다. 팔로워 3천 명대에서
          월 500을 만드는 계정도 있고, 5만 명이어도 판매로 이어지지 않는 계정도 많아요. 팔로워가
          &quot;나에게 무엇을 기대하는지&quot;가 명확하면 규모는 뒤따라옵니다.
        </p>
      </ResourceCard>

      <ResourceCard index="Q2" title="알고리즘의 진짜 신호는 무엇인가요?">
        <p>2026년 인스타 알고리즘은 아래 세 가지를 가장 크게 반영합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>저장</strong> — 나중에 다시 볼 콘텐츠 신호</li>
          <li><strong>공유</strong> — 남에게 알릴 만한 콘텐츠 신호</li>
          <li><strong>완주율 · 재시청</strong> — 릴스 처음 3초와 마지막 3초의 체류</li>
        </ul>
      </ResourceCard>

      <ResourceCard index="Q3" title="릴스와 게시물, 어디에 집중해야 하나요?">
        <p>
          도달을 늘려야 하는 시기라면 <strong>릴스 70 · 게시물 30</strong>. 이미 팬층이 어느 정도
          있고 판매를 시작해야 하는 시기라면 <strong>릴스 40 · 카드뉴스 게시물 40 · 스토리 상시</strong>.
          두 축 모두 &quot;저장·공유&quot;가 나올 만한 앵글이어야 합니다.
        </p>
      </ResourceCard>

      <ResourceCard index="Q4" title="콘텐츠 아이디어는 어떻게 뽑나요?">
        <ol className="list-decimal space-y-1 pl-5">
          <li>내가 자주 받는 DM 질문 20개</li>
          <li>고객이 결제 직전에 했던 걱정 10개</li>
          <li>내 분야 상위 계정 3개의 최근 30개 게시물에서 조회수 상위 5개</li>
          <li>내 개인적인 실패담·전환점 5개</li>
        </ol>
        <p>이 네 개의 리스트만 있어도 3개월치 콘텐츠가 나옵니다.</p>
      </ResourceCard>

      <ResourceCard index="Q5" title="팔로워를 팬으로 바꾸려면?">
        <p>팬은 &quot;정보 소비자&quot;가 아니라 <strong>&quot;나를 응원할 이유가 있는 사람&quot;</strong>입니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>내 실패·성장 서사를 1~2주에 한 번은 노출</li>
          <li>DM 답장은 진심 어리게, 이름을 부르며</li>
          <li>구매 안 한 팔로워에게도 정기적으로 무료 자료·후기 공유</li>
        </ul>
      </ResourceCard>

      <ResourceCard index="Q6" title="스토리는 얼마나 자주 올려야 하나요?">
        <p>
          최소 <strong>주 5회 · 하루 3~5장</strong>이 권장선입니다. 스토리는 알고리즘 신호보다
          &quot;나를 잊지 않게 하는&quot; 효과가 커요. 판매 시즌에는 하루 8~12장까지 무리 없어요.
          중요한 건 &quot;일상 · 인사이트 · 세일즈&quot; 세 종류를 섞는 것.
        </p>
      </ResourceCard>

      <ResourceCard index="Q7" title="태그·해시태그는 몇 개가 적절한가요?">
        <p>
          2026년 기준 해시태그의 <strong>도달 기여도는 크게 낮아졌습니다</strong>. 3~7개 정도만
          &quot;주제 분류&quot;용으로 붙이세요. 대신 <strong>위치 태그·협업 태그(Collab)</strong>가
          도달에 더 유의미하게 작동합니다.
        </p>
      </ResourceCard>

      <ResourceCard index="Q8" title="광고 없이 매출이 가능한가요?">
        <p>
          가능합니다. 다만 <strong>&quot;세일즈 계단&quot;이 있어야</strong> 해요. 무료(전자책) → 미들(라이브·챌린지) →
          프리미엄(1:1·강의) 3단계가 자연스럽게 연결되면 광고 없이도 반복 매출이 나옵니다.
          광고는 이 계단이 &quot;이미 잘 도는&quot; 시점에 부어야 효과가 큽니다.
        </p>
      </ResourceCard>

      <ResourceCard index="Q9" title="DM을 세일즈로 연결하는 법은?">
        <ol className="list-decimal space-y-1 pl-5">
          <li>먼저 <strong>정보를 하나 주고</strong> (즉시 도움 되는 짧은 답)</li>
          <li>그 다음 &quot;혹시 이런 상황이신가요?&quot; 로 <strong>진단</strong></li>
          <li>진단 결과에 맞는 <strong>다음 계단</strong>을 제안 (무료 자료·라이브·상담)</li>
        </ol>
        <p>이 순서가 지켜지면 DM은 자연스러운 세일즈 도구가 됩니다.</p>
      </ResourceCard>

      <ResourceCard index="Q10" title="계정을 폭발적으로 키우는 결정타는?">
        <p>
          결정타는 &quot;대박 릴스 하나&quot;가 아니라 <strong>&quot;확실한 콘셉트 + 30일 이상 지속&quot;</strong> 입니다.
          내가 파는 지식·서비스를 3초 안에 이해시킬 수 있는 콘셉트 문장을 만들고, 그 문장을 30일간
          &quot;다르게 반복&quot;하세요. 그 시점에 대박 릴스가 붙습니다.
        </p>
        <p className="rounded-xl bg-gradient-to-r from-purple-50 via-red-50 to-yellow-50 px-4 py-3 text-sm text-neutral-700">
          다음 자료 &quot;50만+ 인스타 후킹 패턴 50선&quot;에서 실제 콘셉트 문장 만드는 훈련 예시를 확인할 수 있어요.
        </p>
      </ResourceCard>
    </ResourceLayout>
  );
}
