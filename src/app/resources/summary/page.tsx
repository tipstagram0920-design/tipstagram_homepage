import type { Metadata } from "next";
import { ResourceLayout, ResourceCard } from "../ResourceLayout";

export const metadata: Metadata = {
  title: "강의 요약본 | 팁스타그램",
  description: "팁스타그램 라이브 강의의 핵심 내용을 한 장에 정리한 요약본입니다.",
  robots: { index: false, follow: false },
};

export default function SummaryPage() {
  return (
    <ResourceLayout
      eyebrow="LIVE SUMMARY"
      title="팁스타그램 라이브 강의 요약본"
      subtitle="다시 보지 않아도 오늘 실행할 수 있게, 라이브에서 다룬 핵심을 흐름대로 정리했어요."
    >
      <ResourceCard index="1" title="인스타는 '매체'가 아니라 '창구'입니다">
        <p>
          인스타를 콘텐츠 채널로만 보면 팔로워는 늘어도 매출은 안 늘어요. 인스타는
          <strong> 잠재고객이 브랜드와 처음 만나는 창구</strong>입니다. 창구를 잘 만드는 순간
          여러 개의 매출 경로(강의·컨설팅·제휴·굿즈)가 자동으로 연결됩니다.
        </p>
        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          👉 계정 콘셉트를 정할 때 &quot;내가 파는 것&quot;이 아니라 &quot;내가 답해주는 질문&quot;으로 정의해 보세요.
        </p>
      </ResourceCard>

      <ResourceCard index="2" title="매출을 만드는 3개의 축">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>프로필 정비</strong> — 팔로우 결정은 3초 안에 끝납니다. 한 줄로 &quot;누가 · 무엇을 ·
            어떻게&quot; 보여주면 방문자의 90%가 팔로우 여부를 판단해요.
          </li>
          <li>
            <strong>피드·릴스 구성</strong> — 최근 9개 게시물이 브랜드의 첫인상입니다. 릴스는
            &quot;후킹 3초 → 정보 → 마무리 CTA&quot; 구조를 반복하세요.
          </li>
          <li>
            <strong>세일즈 계단</strong> — 무료(전자책·라이브) → 미들(강의·챌린지) → 프리미엄(1:1·컨설팅).
            팔로워를 한 번에 끌어올리지 말고, 다음 계단으로 &quot;한 칸&quot;만 안내하세요.
          </li>
        </ol>
      </ResourceCard>

      <ResourceCard index="3" title="알고리즘의 진짜 신호">
        <p>알고리즘은 좋아요·팔로워 수보다 아래 세 가지를 더 크게 봅니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>저장</strong> — &quot;나중에 다시 볼 만한 가치&quot; 신호 (릴스에서 가중치 최고)</li>
          <li><strong>공유</strong> — &quot;남에게 알려도 될 콘텐츠&quot; 신호 (도달 폭발의 방아쇠)</li>
          <li><strong>체류·재시청</strong> — 릴스에서 처음 3초를 넘기면 그 다음 3초의 체류가 곧 도달</li>
        </ul>
        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          👉 게시물마다 &quot;저장·공유하고 싶은 이유&quot;를 한 줄로 정해두면 콘텐츠 방향이 흔들리지 않아요.
        </p>
      </ResourceCard>

      <ResourceCard index="4" title="릴스 3초 후킹의 공식">
        <p>
          릴스는 처음 3초에 이탈 여부가 결정됩니다. 정보 나열보다 &quot;시청자의 머리를 잠깐 멈추게 하는&quot;
          한 문장이 앞에 와야 해요.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>숫자로 여는 문장 — &quot;3개월 만에 팔로워 12만이 붙은 이유&quot;</li>
          <li>반전 — &quot;팔로워가 늘어도 매출이 안 나는 진짜 이유&quot;</li>
          <li>내 이야기 — &quot;직장 다니면서 인스타로 월 500 만들 때 매일 했던 것&quot;</li>
          <li>공포·후회 — &quot;인스타 하다가 이걸 놓친 사람이 90%&quot;</li>
        </ul>
      </ResourceCard>

      <ResourceCard index="5" title="세일즈 계단을 자동화하는 법">
        <ol className="list-decimal space-y-2 pl-5">
          <li>계정 링크트리(bio 링크)를 &quot;다음 계단 한 개&quot;만 가리키게 두세요.</li>
          <li>스토리 하이라이트에는 후기·자주 묻는 질문·무료 자료 신청 세 가지만 상단에.</li>
          <li>DM 자주 오는 질문 세 가지에는 자동 답장 대신 <strong>정성 답장 템플릿</strong>을 준비.</li>
          <li>주 1회 &quot;무료 자료 → 라이브 → 유료 상품&quot; 흐름을 반복 노출.</li>
        </ol>
      </ResourceCard>

      <ResourceCard index="6" title="오늘부터 30일 안에 할 세 가지">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>프로필을 &quot;내가 답해주는 질문&quot; 관점으로 다시 씁니다.</li>
          <li>릴스 5개를 &quot;후킹 3초 → 정보 → CTA&quot; 구조로 촬영합니다.</li>
          <li>DM으로 오는 세 가지 질문에 &quot;다음 계단&quot;을 자연스럽게 안내하는 답장 템플릿을 만듭니다.</li>
        </ul>
        <p className="mt-4 rounded-xl bg-gradient-to-r from-purple-50 via-red-50 to-yellow-50 px-4 py-3 text-sm text-neutral-700">
          라이브에서 못 다룬 세부 실행법은 아래 두 자료에도 담겨 있어요. 자주 묻는 질문 10개와 후킹 패턴 50선을 함께 보시면 실행 속도가 붙습니다.
        </p>
      </ResourceCard>
    </ResourceLayout>
  );
}
