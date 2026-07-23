import Anthropic from "@anthropic-ai/sdk";

// 5주 챌린지 숙제에 대한 강사 피드백 초안을 Claude로 자동 생성한다.
// 생성된 초안은 어드민에서 검토 후 '전송'해야 학생에게 발송된다(자동 발송 아님).

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `당신은 인스타그램 마케팅 교육 브랜드 "팁스타그램"의 5주 챌린지 강사입니다.
수강생이 제출한 이번 주 숙제를 읽고, 강사 입장에서 피드백을 작성합니다.

작성 원칙:
- 한국어로, 따뜻하지만 구체적이고 실행 가능한 피드백.
- 잘한 점 1~2가지를 먼저 짚어주고, 개선하면 좋을 점 2~3가지를 구체적으로.
- 두루뭉술한 칭찬/지적 금지. 제출 내용을 근거로 짚기.
- 다음 주에 무엇을 하면 좋을지 한 줄 액션으로 마무리.
- 전체 300~500자 내외. 마크다운/머리말 없이 자연스러운 문단으로.
- 반드시 피드백 본문만 출력. 서두("아래는 피드백입니다" 등)나 메타 설명 금지.`;

export function isAiFeedbackConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function generateFeedbackText(opts: {
  weekIndex: number;
  weekTitle?: string | null;
  studentName?: string | null;
  content: string;
}): Promise<string | null> {
  if (!isAiFeedbackConfigured()) return null;
  const client = new Anthropic();

  const prompt = `[Week ${opts.weekIndex}${opts.weekTitle ? ` · ${opts.weekTitle}` : ""}] 숙제 제출 내용:
${opts.content?.trim() || "(제출 내용이 비어 있음)"}

위 제출에 대한 강사 피드백을 작성해 주세요.`;

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || null;
  } catch (e) {
    console.error("[ai-feedback] 생성 실패:", (e as Error).message);
    return null;
  }
}
