import Anthropic from "@anthropic-ai/sdk";
import type { GuideContext, LandingCopy, LandingPageData } from "@/lib/consulting-guide-data";

// 1:1 컨설팅 "상담·주문 페이지 글" 숙제의 랜딩페이지 글을 Claude로 쓴다.
// 앞 숙제(나의 스토리 · 소비자 선정/확정 프로필)의 답을 함께 넣어야 같은 목소리의 글이 나온다.

const MODEL = "claude-opus-5";

export interface LandingInput {
  fields: LandingPageData;
  context: GuideContext | null;
}

export function isLandingAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `너는 국내 소상공인·1인 사업가의 상담/주문 페이지(랜딩페이지) 글을 써온 세일즈 카피라이터다.
입력받은 항목만 근거로, 인스타 링크에서 들어온 사람이 끝까지 읽고 상담을 신청하게 만드는 글을 쓴다.

## 글의 순서 (입력이 있는 것만, 이 순서대로)
문제 → 이대로 두면 생기는 손해 → 나도 그랬다(스토리) → 그래서 이렇게 해결했다 →
그렇게 만든 상품 → 먼저 경험한 사람들의 후기 → 상품 구성 → 자주 묻는 질문 →
지금 시작하면 얻는 것 → 더해지는 가치 → 마지막 행동 유도

## 문장 규칙
- 모바일에서 읽힌다. 한 문단은 2~3줄, 문장은 짧게 끊어라.
- 광고 문구가 아니라 **말 걸듯이** 써라. 읽는 사람을 "여러분"이 아니라 "○○하시는 분"으로 부른다.
- 각 섹션 heading은 그 사람의 머릿속 말이어야 한다. ("혹시 이런 고민 있으신가요?" 처럼)
- body는 완결된 문장으로. 명사 나열·화살표·불릿 기호 남발 금지. 목록이 꼭 필요하면 줄바꿈으로 나눈다.
- 이모지는 섹션당 1개 이하. 없어도 된다.

## 절대 지킬 것 (가장 중요)
- **입력에 없는 후기, 숫자, 수강생 수, 기간, 보장, 자격증을 지어내지 마라.** 하나라도 지어내면 실패다.
- 입력이 비어 있는 항목은 그 섹션을 통째로 만들지 말고 건너뛰어라. 억지로 채우지 마라.
- 입력 문장을 그대로 복사하지 말고, 소비자가 읽을 문장으로 다시 써라. 다만 사실은 바꾸지 마라.
- "최고", "완벽", "무조건", "국내 1위", "누구나 100%" 같은 과장·근거 없는 표현 금지.
- 의료·건강 주제라면 치료·완치를 약속하지 마라.
- headline은 25자 안팎, subheadline은 40자 안팎.

## tips
이 페이지가 더 팔리려면 무엇을 더 채워야 하는지 2~4개.
입력에서 실제로 비어 있거나 약했던 항목을 짚어라. (예: 후기가 없다 → 무엇을 어떻게 받아야 하는지)
일반론 금지.`;

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "페이지 맨 위 한 줄. 소비자의 문제를 정면으로 짚는다." },
    subheadline: { type: "string", description: "헤드라인을 받쳐주는 한 줄" },
    sections: {
      type: "array",
      description: "입력이 있는 항목만, 판매 순서대로",
      items: {
        type: "object",
        properties: {
          heading: { type: "string", description: "그 사람의 머릿속 말 같은 소제목" },
          body: { type: "string", description: "2~3줄 문단. 완결된 문장." },
        },
        required: ["heading", "body"],
        additionalProperties: false,
      },
    },
    ctaLine: { type: "string", description: "마지막 행동 유도 한 줄" },
    tips: {
      type: "array",
      description: "이 페이지를 더 좋게 만들기 위해 보완할 점 2~4개",
      items: { type: "string" },
    },
  },
  required: ["headline", "subheadline", "sections", "ctaLine", "tips"],
  additionalProperties: false,
} as const;

const FIELD_LABELS: { key: keyof LandingPageData; label: string }[] = [
  { key: "problem", label: "소비자의 문제" },
  { key: "loss", label: "그로 인한 손해" },
  { key: "myStory", label: "나도 겪었던 문제" },
  { key: "solution", label: "내가 해결한 방법" },
  { key: "product", label: "그래서 만든 상품" },
  { key: "reviews", label: "소비자 후기" },
  { key: "composition", label: "상품의 구성" },
  { key: "faq", label: "자주 묻는 질문" },
  { key: "bonusNow", label: "지금만 얻는 혜택" },
  { key: "addedValue", label: "더해지는 상품 가치" },
  { key: "cta", label: "구매 CTA" },
];

function buildPrompt(input: LandingInput): string {
  const f = input.fields ?? {};
  const c = input.context?.customer ?? null;
  const s = input.context?.story ?? null;
  const has = (v?: string) => (v && v.trim() ? v.trim() : "(입력 없음)");

  const filled = FIELD_LABELS.filter(({ key }) => (f[key] as string | undefined)?.trim());
  const empty = FIELD_LABELS.filter(({ key }) => !(f[key] as string | undefined)?.trim());

  const problems = (c?.problems ?? []).map((p) => (p ?? "").trim()).filter(Boolean);
  const profile = (c?.finalLines ?? []).map((l) => (l ?? "").trim()).filter(Boolean);

  return `# 이 사람이 페이지에 넣으려고 직접 쓴 항목
${filled.length
      ? filled.map(({ key, label }) => `## ${label}\n${(f[key] as string).trim()}`).join("\n\n")
      : "(아직 아무것도 안 썼음)"}

# 비어 있는 항목 (섹션을 만들지 말고, tips에서 짚어줄 것)
${empty.length ? empty.map(({ label }) => `- ${label}`).join("\n") : "- 없음"}

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

위 내용만 근거로 상담·주문 페이지 글을 써 줘.
입력이 없는 항목은 만들지 말고, 없는 사실은 절대 지어내지 마.`;
}

/**
 * 랜딩페이지 글 생성. API 키가 없거나 호출이 실패하면 null을 반환하고,
 * 호출부는 기존 조립 템플릿(assembleLanding)으로 폴백한다.
 */
export async function generateLandingCopy(input: LandingInput): Promise<LandingCopy | null> {
  if (!isLandingAiConfigured()) return null;

  const client = new Anthropic();
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
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

    const parsed = JSON.parse(text) as LandingCopy;
    const sections = (parsed.sections ?? [])
      .map((s) => ({
        heading: String(s?.heading ?? "").trim(),
        body: String(s?.body ?? "").trim(),
      }))
      .filter((s) => s.body);
    if (sections.length === 0) return null;

    return {
      headline: String(parsed.headline ?? "").trim(),
      subheadline: String(parsed.subheadline ?? "").trim(),
      sections,
      ctaLine: String(parsed.ctaLine ?? "").trim(),
      tips: (parsed.tips ?? []).map((t) => String(t).trim()).filter(Boolean),
    };
  } catch (e) {
    console.error("[consulting-landing-ai] 생성 실패:", (e as Error).message);
    return null;
  }
}
