import Anthropic from "@anthropic-ai/sdk";
import type { GuideContext, PageCopy } from "@/lib/consulting-guide-data";

// 인포크 링크에 넣을 페이지(무료자료·체험·이벤트 / 후기 / FAQ)의 글을 Claude로 쓴다.
// 랜딩페이지 생성기(consulting-landing-ai.ts)와 같은 구조를 쓰되, 종류별로 프롬프트만 갈라진다.

const MODEL = "claude-opus-5";

/** 만들 페이지 종류. freebie/trial/event 는 첫 번째 버튼(무료자료) 숙제의 세 갈래다. */
export type PageKind = "freebie" | "trial" | "event" | "proof" | "faq";

export interface PageGenerateInput {
  kind: PageKind;
  /** 숙제에서 받은 질문·답변 (라벨을 그대로 프롬프트에 넣는다) */
  answers: { label: string; value: string }[];
  context: GuideContext | null;
}

export function isPageAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** 모든 페이지가 함께 지키는 규칙 */
const COMMON_RULES = `## 문장 규칙
- 모바일에서 읽힌다. 한 문단은 2~3줄, 문장은 짧게 끊어라.
- 광고 문구가 아니라 말 걸듯이 써라. 읽는 사람을 "여러분"이 아니라 "○○하시는 분"으로 부른다.
- 각 섹션 heading은 읽는 사람의 머릿속 말이어야 한다.
- body는 완결된 문장으로. 명사 나열·화살표 남발 금지.
- 이모지는 섹션당 1개 이하. 없어도 된다.

## 절대 지킬 것 (가장 중요)
- **입력에 없는 후기, 숫자, 인원, 기간, 보장, 자격증을 지어내지 마라.** 하나라도 지어내면 실패다.
- 입력이 비어 있는 내용은 섹션을 만들지 말고 건너뛰어라. 억지로 채우지 마라.
- 입력 문장을 그대로 복사하지 말고 읽는 사람의 문장으로 다시 써라. 다만 사실은 바꾸지 마라.
- "최고", "완벽", "무조건", "1위", "누구나 100%" 같은 과장 표현 금지.
- 의료·건강 주제라면 치료·완치를 약속하지 마라.
- headline은 25자 안팎, subheadline은 40자 안팎.

## tips
이 페이지가 더 좋아지려면 무엇을 더 채워야 하는지 2~4개. 입력에서 실제로 빈약했던 지점을 짚어라. 일반론 금지.`;

const PROMPTS: Record<PageKind, { role: string; goal: string; deliverable: string }> = {
  freebie: {
    role: "너는 소상공인·1인 사업가의 무료자료 신청 페이지를 만들어온 카피라이터다.",
    goal: `이 페이지의 목적은 **연락처를 남기고 자료를 받아가게 하는 것** 하나다. 상품을 팔지 마라.
순서: 이런 고민 있으시죠 → 그래서 이걸 만들었습니다(자료 소개) → 자료에 뭐가 들었는지 → 받으면 뭐가 달라지는지 → 누가 주는지(신뢰) → 받는 방법.
자료를 받는 데 드는 부담이 없다는 걸 분명히 하라.`,
    deliverable: `deliverable 에는 **나눠줄 자료 자체의 초안**을 담아라.
title 은 자료 제목(사람들이 받고 싶어질 제목), items 는 목차 3~6개 — heading 은 각 장 제목, body 는 그 장에 들어갈 핵심 내용 3~5줄.
입력에 없는 전문 지식을 지어내지 말고, 이 사람이 실제로 쓴 답 안에서 구성하라.`,
  },
  trial: {
    role: "너는 소상공인·1인 사업가의 무료체험 신청 페이지를 만들어온 카피라이터다.",
    goal: `이 페이지의 목적은 **부담 없이 체험을 신청하게 하는 것**이다. 상품 판매가 아니다.
순서: 이런 고민 있으시죠 → 그래서 체험을 준비했습니다 → 무엇을 하는지 → 얼마나 걸리는지 → 끝나고 무엇을 얻어가는지 → 신청 방법.
"체험만 받고 안 사도 된다"는 안심을 반드시 한 줄 넣어라.`,
    deliverable: `deliverable 에는 **체험 진행 순서**를 담아라.
title 은 "체험은 이렇게 진행됩니다" 류, items 는 3~5단계 — heading 은 "1. ○○", body 는 그 단계에서 무엇을 하는지 2~3줄.`,
  },
  event: {
    role: "너는 소상공인·1인 사업가의 이벤트 안내 페이지를 만들어온 카피라이터다.",
    goal: `이 페이지의 목적은 **이벤트에 참여하게 하는 것**이다.
순서: 이런 고민 있으시죠 → 그래서 이런 이벤트를 엽니다 → 무엇을 받는지 → 언제까지인지 → 어떻게 참여하는지.
기간이 입력돼 있으면 마감을 분명히 보여줘라. 없는 기간을 지어내지는 마라.`,
    deliverable: `deliverable 에는 **참여 방법**을 담아라.
title 은 "참여 방법" 류, items 는 3~5단계 — heading 은 "1. ○○", body 는 그 단계에서 무엇을 해야 하는지 1~3줄.`,
  },
  proof: {
    role: "너는 소상공인·1인 사업가의 후기·변화 스토리 페이지를 만들어온 카피라이터다.",
    goal: `이 페이지의 목적은 **"이 사람 말은 믿을 만하다"를 만드는 것**이다.
후기가 입력돼 있으면 후기를 중심으로, 후기가 없으면 **이 사람 자신의 변화 스토리(그때 → 지금)**를 중심으로 쓴다.
순서: 나도 그랬습니다 → 무엇이 문제였는지 → 무엇을 바꿨는지 → 지금은 어떤지 → (후기가 있으면) 먼저 경험한 분들 → 다음 단계 안내.
**후기를 만들어내지 마라.** 입력에 있는 후기만 쓰고, 없으면 후기 섹션 자체를 만들지 마라.`,
    deliverable: `후기가 2개 이상 입력돼 있으면 deliverable 에 **후기 카드 목록**을 담아라.
title 은 "먼저 경험한 분들" 류, items 는 후기마다 하나씩 — heading 은 "○○님", body 는 어떤 상태에서 어떻게 바뀌었는지 2~3줄로 정리(내용을 보태지 말 것).
후기가 없으면 deliverable 은 비워라(null).`,
  },
  faq: {
    role: "너는 소상공인·1인 사업가의 자주 묻는 질문 페이지를 만들어온 카피라이터다.",
    goal: `이 페이지의 목적은 **상담 전에 걸리는 의심을 미리 걷어내는 것**이다.
sections 하나가 질문 하나다. heading 은 실제 사람이 물어보는 말투의 질문("초보인데 따라갈 수 있나요?"), body 는 답변 2~4줄.
가격·기간·환불·초보 가능 여부처럼 입력이 있는 것만 답하라. 입력이 없는 질문은 만들지 마라.
답변은 방어적으로 쓰지 말고, 솔직하게 쓰되 마지막은 안심시켜라.`,
    deliverable: `deliverable 은 비워라(null). 질문과 답은 전부 sections 에 담는다.`,
  },
};

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "페이지 맨 위 한 줄" },
    subheadline: { type: "string", description: "헤드라인을 받쳐주는 한 줄" },
    sections: {
      type: "array",
      description: "입력이 있는 내용만, 지시된 순서대로",
      items: {
        type: "object",
        properties: {
          heading: { type: "string", description: "읽는 사람의 머릿속 말 같은 소제목" },
          body: { type: "string", description: "2~4줄 문단. 완결된 문장." },
        },
        required: ["heading", "body"],
        additionalProperties: false,
      },
    },
    ctaLine: { type: "string", description: "마지막 행동 유도 한 줄" },
    tips: {
      type: "array",
      description: "더 좋게 만들기 위해 보완할 점 2~4개",
      items: { type: "string" },
    },
    deliverable: {
      type: ["object", "null"],
      description: "페이지 글과 별개로 나오는 결과물 (없으면 null)",
      properties: {
        title: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              body: { type: "string" },
            },
            required: ["heading", "body"],
            additionalProperties: false,
          },
        },
      },
      required: ["title", "items"],
      additionalProperties: false,
    },
  },
  required: ["headline", "subheadline", "sections", "ctaLine", "tips", "deliverable"],
  additionalProperties: false,
} as const;

function systemPrompt(kind: PageKind): string {
  const p = PROMPTS[kind];
  return `${p.role}
입력받은 내용만 근거로 페이지 글을 쓴다.

## 이 페이지의 목적
${p.goal}

## deliverable
${p.deliverable}

${COMMON_RULES}`;
}

function buildPrompt(input: PageGenerateInput): string {
  const c = input.context?.customer ?? null;
  const s = input.context?.story ?? null;
  const has = (v?: string) => (v && v.trim() ? v.trim() : "(입력 없음)");

  const answered = input.answers.filter((a) => a.value.trim());
  const empty = input.answers.filter((a) => !a.value.trim());
  const problems = (c?.problems ?? []).map((p) => (p ?? "").trim()).filter(Boolean);
  const profile = (c?.finalLines ?? []).map((l) => (l ?? "").trim()).filter(Boolean);

  return `# 이 사람이 직접 쓴 답
${answered.length
      ? answered.map((a) => `## ${a.label}\n${a.value.trim()}`).join("\n\n")
      : "(아직 아무것도 안 썼음)"}

# 비어 있는 항목 (섹션을 만들지 말고, tips에서 짚어줄 것)
${empty.length ? empty.map((a) => `- ${a.label}`).join("\n") : "- 없음"}

# 참고 — 앞 숙제에 쓴 내용 (같은 목소리로 쓰기 위한 재료. 사실을 바꾸지 말 것)
- 확정한 인스타 프로필: ${profile.length ? `\n${profile.map((l) => `  · ${l}`).join("\n")}` : "(없음)"}
- 타겟 한 줄: ${has(c?.personaLine)}
- 타겟 상세: ${has(c?.personaDetail)}
- 소비자가 가진 문제:
${problems.length ? problems.map((p, i) => `  ${i + 1}. ${p}`).join("\n") : "  (입력 없음)"}
- 해결되면 나타나는 변화: ${has(c?.change)}
- 나도 겪었던 문제: ${has(c?.myProblem || s?.origin)}
- 나를 바꾼 결정적인 한 가지: ${has(c?.myTurning || s?.turningPoint)}
- 지금은 어떻게 해결했나: ${has(s?.howSolved)}
- 내 전문성의 근거: ${has(c?.myProof || s?.expertise)}
- 숫자로 말할 수 있는 것: ${has(s?.numbers)}

위 내용만 근거로 페이지 글을 써 줘. 없는 사실은 절대 지어내지 마.`;
}

/**
 * 페이지 글 생성. API 키가 없거나 호출이 실패하면 null을 반환하고,
 * 호출부는 입력값을 순서대로 조립한 폴백을 보여준다.
 */
export async function generatePageCopy(input: PageGenerateInput): Promise<PageCopy | null> {
  if (!isPageAiConfigured()) return null;

  const client = new Anthropic();
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: systemPrompt(input.kind),
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [{ role: "user", content: buildPrompt(input) }],
    });

    if (resp.stop_reason === "refusal") return null;

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!text) return null;

    const parsed = JSON.parse(text) as PageCopy;
    const clean = (arr: unknown) =>
      (Array.isArray(arr) ? arr : [])
        .map((x) => ({
          heading: String((x as { heading?: unknown })?.heading ?? "").trim(),
          body: String((x as { body?: unknown })?.body ?? "").trim(),
        }))
        .filter((x) => x.body || x.heading);

    const sections = clean(parsed.sections);
    if (sections.length === 0) return null;

    const dItems = clean(parsed.deliverable?.items);
    return {
      headline: String(parsed.headline ?? "").trim(),
      subheadline: String(parsed.subheadline ?? "").trim(),
      sections,
      ctaLine: String(parsed.ctaLine ?? "").trim(),
      tips: (parsed.tips ?? []).map((t) => String(t).trim()).filter(Boolean),
      deliverable: dItems.length
        ? { title: String(parsed.deliverable?.title ?? "").trim(), items: dItems }
        : null,
    };
  } catch (e) {
    console.error("[consulting-page-ai] 생성 실패:", (e as Error).message);
    return null;
  }
}
