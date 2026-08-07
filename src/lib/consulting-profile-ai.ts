import Anthropic from "@anthropic-ai/sdk";

// 1:1 컨설팅 "소비자 선정 → 프로필 추천" 숙제의 프로필 문구를 Claude로 생성한다.
// 기존에는 입력값을 잘라 붙이는 템플릿(buildProfiles)이었어서 결과가 기계적이었다.
// 템플릿은 API 키가 없거나 호출이 실패했을 때의 폴백으로만 남는다.

const MODEL = "claude-opus-5";

/** 인스타 소개글 글자 수 상한 (공백·줄바꿈 포함) */
export const IG_BIO_LIMIT = 150;

export interface ProfileInput {
  problems: string[];
  change: string;
  personaLine: string;
  personaDetail?: string;
  expertise?: string;
}

export interface ProfileVersion {
  /** 버전 이름 (예: "① 타겟 지목형") */
  name: string;
  /** 이 버전이 노리는 각도 한 줄 */
  angle: string;
  /** 실제 프로필 소개글 (줄 단위, 3~4줄) */
  lines: string[];
  /** 왜 이렇게 썼는지 한 줄 설명 */
  reason: string;
}

export interface ProfileSuggestion {
  versions: ProfileVersion[];
  /** 프로필을 더 좋게 만들기 위한 개선 팁 */
  tips: string[];
}

export function isProfileAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `너는 국내 소상공인·1인 사업가의 인스타그램 계정을 키워온 프로필 카피라이터다.
입력받은 "소비자의 문제 / 문제 해결 후의 변화 / 페르소나 / 판매자의 전문성"을 근거로,
인스타그램 프로필 소개글(bio) 3가지 버전을 쓴다.

## 좋은 인스타 프로필의 조건
- 첫 줄에서 "이 계정이 누구를 위한 곳인지"가 즉시 잡혀야 한다.
- 두 번째 줄부터는 여기 있으면 무엇을 얻는지가 구체적으로 보여야 한다.
- 신뢰 근거(경력·실적·자격)가 있으면 한 줄로 넣는다. 없으면 억지로 만들지 않는다.
- 마지막 줄은 행동 유도(팔로우 / 링크 클릭 / DM). 짧게.
- 전체 ${IG_BIO_LIMIT}자 이내(공백·줄바꿈 포함). 3~4줄.
- 한 줄은 20자 안팎으로 짧게 끊는다. 모바일에서 줄이 넘치면 읽히지 않는다.

## 반드시 지킬 것
- 입력값의 단어를 그대로 잘라 붙이지 마라. 소비자가 실제로 쓰는 말로 다시 써라.
- 3가지 버전은 서로 다른 각도여야 한다. 같은 문장을 조사만 바꿔 반복하지 마라.
- 이모지는 줄당 최대 1개. 장식용으로 흩뿌리지 마라.
- 근거 없는 숫자·수상·1위 표현 금지. 입력에 있는 실적만 쓴다.
- "최고", "완벽", "무조건" 같은 과장 표현 금지.
- 입력이 부실하면 억지로 채우지 말고, 그 자리를 비운 채 tips에서 무엇을 더 채워야 하는지 알려준다.

## 3가지 버전의 각도
1. 타겟 지목형 — 페르소나를 정면으로 불러 세운다. "이건 당신 이야기"라고 느끼게.
2. 문제 공감형 — 소비자가 지금 겪는 고통을 먼저 말하고, 여기서 풀린다고 잇는다.
3. 전문가 신뢰형 — 판매자의 경력·실적을 앞세워 "이 사람 말은 믿을 만하다"를 만든다.

## tips
프로필 자체가 아니라, 이 사람이 프로필을 더 좋게 만들려면 무엇을 보완해야 하는지 2~4개.
입력값에서 실제로 빈약했던 지점을 짚어라. 일반론 금지.`;

const SCHEMA = {
  type: "object",
  properties: {
    versions: {
      type: "array",
      description: "프로필 소개글 3가지 버전",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "버전 이름 (예: 타겟 지목형)" },
          angle: { type: "string", description: "이 버전이 노리는 각도 한 줄" },
          lines: {
            type: "array",
            description: "프로필 소개글의 각 줄 (3~4개, 한 줄 20자 안팎)",
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
  return `## 소비자가 가진 문제
${problems.length ? problems.map((p, i) => `${i + 1}. ${p.trim()}`).join("\n") : "(입력 없음)"}

## 이 문제들이 해결되면 나타나는 변화
${input.change.trim() || "(입력 없음)"}

## 페르소나 (타겟 한 줄)
${input.personaLine.trim() || "(입력 없음)"}

## 페르소나 상세
${input.personaDetail?.trim() || "(입력 없음)"}

## 나의 전문성·경력
${input.expertise?.trim() || "(입력 없음)"}

위 내용을 근거로 인스타 프로필 소개글 3가지 버전과 보완 팁을 만들어 줘.`;
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
      .filter((v) => Array.isArray(v?.lines) && v.lines.some((l) => l?.trim()))
      .map((v) => ({
        name: String(v.name ?? "").trim() || "프로필 버전",
        angle: String(v.angle ?? "").trim(),
        lines: v.lines.map((l) => String(l).trim()).filter(Boolean),
        reason: String(v.reason ?? "").trim(),
      }));
    if (versions.length === 0) return null;

    const tips = (parsed.tips ?? []).map((t) => String(t).trim()).filter(Boolean);
    return { versions, tips };
  } catch (e) {
    console.error("[consulting-profile-ai] 생성 실패:", (e as Error).message);
    return null;
  }
}
