import Anthropic from "@anthropic-ai/sdk";

// 1:1 컨설팅 "소비자 선정 → 프로필 추천" 숙제의 프로필 문구를 Claude로 생성한다.
// 앞 숙제(나의 스토리·전문성)에서 받은 답까지 함께 넣어야 첫 줄의 전문가 소개가 살아난다.

const MODEL = "claude-opus-5";

/** 인스타 소개글 글자 수 상한 (공백·줄바꿈 포함) */
export const IG_BIO_LIMIT = 150;

/** 앞 숙제(my-story)에서 받은 답 */
export interface StoryInput {
  origin?: string;
  turningPoint?: string;
  howSolved?: string;
  expertise?: string;
  numbers?: string;
}

export interface ProfileInput {
  problems: string[];
  change: string;
  personaLine: string;
  personaDetail?: string;
  expertise?: string;
  story?: StoryInput | null;
}

export interface ProfileVersion {
  name: string;
  /** 이 버전이 노리는 각도 한 줄 */
  angle: string;
  /** 프로필 소개글 3줄 — [전문가 소개, 타겟에게 주는 가치, 팔로우 후의 변화] */
  lines: string[];
  /** 왜 이렇게 썼는지 한 줄 설명 */
  reason: string;
}

export interface ProfileSuggestion {
  versions: ProfileVersion[];
  tips: string[];
}

export function isProfileAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `너는 국내 소상공인·1인 사업가의 인스타그램 프로필을 만들어온 카피라이터다.
입력을 근거로 인스타 프로필 소개글(bio) 3가지 버전을 쓴다.

## 프로필 3줄 구조 (반드시 이 순서, 이 역할)
1줄 — **내가 어떤 전문가인지.** 증명 가능한 숫자가 있으면 숫자를 앞세운다.
       예) "8년차 자세교정 전문가 · 교정 후기 300건"
2줄 — **누구에게 어떤 가치를 주는지.** 타겟을 명시하고, 여기서 무엇을 얻는지 쓴다.
       예) "하루 8시간 앉아 일하는 직장인의 허리 통증을 잡아드립니다"
3줄 — **팔로우하고 나면 달라지는 소비자의 모습.** 나에 대한 말이 아니라 그 사람의 변화다.
       예) "퇴근할 때 허리를 안 짚는 하루가 됩니다"

## 문장 규칙 (가장 중요)
- **각 줄은 끊어진 단어 조각이 아니라 읽히는 한 문장이어야 한다.**
  "○○ 해결 꿀팁 매일", "팔로우 → 변화" 같은 명사 나열·화살표 금지.
  조사와 서술어를 갖춘 자연스러운 한국어로 쓴다.
- 3줄이 이어 읽었을 때 하나의 말이 되어야 한다. 줄마다 따로 노는 문장 금지.
- 전체 ${IG_BIO_LIMIT}자 이내(공백·줄바꿈 포함). 한 줄은 25자 안팎.
- 이모지는 전체 2개 이하. 줄 맨 앞 장식용 이모지 남발 금지.

## 반드시 지킬 것
- 입력값의 단어를 그대로 잘라 붙이지 마라. 소비자가 쓰는 말로 다시 써라.
- 숫자는 입력에 있는 것만 쓴다. 없으면 숫자 없이 전문성을 표현한다. **지어내기 절대 금지.**
- 3가지 버전은 서로 다른 각도여야 한다. 조사만 바꾼 반복 금지.
- "최고", "완벽", "무조건", "1위" 같은 과장·근거 없는 표현 금지.
- 해시태그를 넣지 마라.
- 입력이 부실하면 억지로 채우지 말고, 그 자리를 비운 채 tips에서 무엇을 더 채워야 하는지 알려준다.

## 3가지 버전의 각도
1. 전문가 신뢰형 — 경력·숫자를 앞세워 "이 사람 말은 믿을 만하다"를 만든다.
2. 문제 공감형 — 소비자가 지금 겪는 고통을 짚고, 여기서 풀린다고 잇는다.
3. 변화 약속형 — 팔로우 이후 달라질 모습을 가장 앞에서 그린다.

세 버전 모두 위의 3줄 구조(전문가 → 가치 → 변화)를 지키되, 어디에 힘을 주는지가 다르다.

## tips
이 사람이 프로필을 더 좋게 만들려면 무엇을 보완해야 하는지 2~4개.
입력에서 실제로 빈약했던 지점을 짚어라. 일반론 금지.`;

const SCHEMA = {
  type: "object",
  properties: {
    versions: {
      type: "array",
      description: "프로필 소개글 3가지 버전",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "버전 이름 (예: 전문가 신뢰형)" },
          angle: { type: "string", description: "이 버전이 노리는 각도 한 줄" },
          lines: {
            type: "array",
            description:
              "정확히 3줄. [1] 내가 어떤 전문가인지 [2] 누구에게 어떤 가치를 주는지 [3] 팔로우 후 달라질 소비자의 모습. 각 줄은 완결된 문장.",
            items: { type: "string" },
          },
          reason: { type: "string", description: "왜 이렇게 썼는지 한 줄" },
        },
        required: ["name", "angle", "lines", "reason"],
        additionalProperties: false,
      },
    },
    tips: {
      type: "array",
      description: "프로필을 더 좋게 만들기 위해 보완할 점 2~4개",
      items: { type: "string" },
    },
  },
  required: ["versions", "tips"],
  additionalProperties: false,
} as const;

function buildPrompt(input: ProfileInput): string {
  const problems = input.problems.filter((p) => p.trim());
  const s = input.story ?? {};
  const has = (v?: string) => (v && v.trim() ? v.trim() : "(입력 없음)");

  return `# 내 이야기 (프로필 1줄·3줄의 재료)
- 이 일을 시작한 계기: ${has(s.origin)}
- 문제를 넘을 때 가장 중요했던 것: ${has(s.turningPoint)}
- 지금은 그 문제를 어떻게 해결했나: ${has(s.howSolved)}
- 전문성을 증명하는 것: ${has(s.expertise || input.expertise)}
- 숫자로 말할 수 있는 것: ${has(s.numbers)}

# 소비자
- 소비자가 가진 문제:
${problems.length ? problems.map((p, i) => `  ${i + 1}. ${p.trim()}`).join("\n") : "  (입력 없음)"}
- 이 문제들이 해결되면 나타나는 변화: ${has(input.change)}
- 타겟 한 줄: ${has(input.personaLine)}
- 타겟 상세: ${has(input.personaDetail)}

위 내용을 근거로, 3줄 구조(전문가 소개 → 타겟에게 주는 가치 → 팔로우 후의 변화)를 지킨
인스타 프로필 3가지 버전과 보완 팁을 만들어 줘.
각 줄은 반드시 조사와 서술어를 갖춘 완결된 문장으로 써 줘.`;
}

/** 3줄이 아니거나 조각 문장이면 최소한의 정리를 한다 */
function normalizeLines(lines: unknown): string[] {
  const arr = Array.isArray(lines) ? lines : [];
  return arr
    .map((l) => String(l).replace(/\s*→\s*/g, " ").replace(/#[^\s#]+/g, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

/**
 * 프로필 추천 생성. API 키가 없거나 호출이 실패하면 null을 반환하고,
 * 호출부는 기존 템플릿(buildProfiles)으로 폴백한다.
 */
export async function generateProfileSuggestion(
  input: ProfileInput
): Promise<ProfileSuggestion | null> {
  if (!isProfileAiConfigured()) return null;

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

    const parsed = JSON.parse(text) as ProfileSuggestion;
    const versions = (parsed.versions ?? [])
      .map((v) => ({
        name: String(v?.name ?? "").trim() || "프로필 버전",
        angle: String(v?.angle ?? "").trim(),
        lines: normalizeLines(v?.lines),
        reason: String(v?.reason ?? "").trim(),
      }))
      .filter((v) => v.lines.length >= 2);
    if (versions.length === 0) return null;

    const tips = (parsed.tips ?? []).map((t) => String(t).trim()).filter(Boolean);
    return { versions, tips };
  } catch (e) {
    console.error("[consulting-profile-ai] 생성 실패:", (e as Error).message);
    return null;
  }
}
