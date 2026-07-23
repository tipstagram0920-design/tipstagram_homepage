import Anthropic from "@anthropic-ai/sdk";

// 5주 챌린지 숙제에 대한 강사 피드백 초안을 Claude로 자동 생성한다.
// 생성된 초안은 어드민에서 검토 후 '전송'해야 학생에게 발송된다(자동 발송 아님).

const MODEL = "claude-opus-4-8";

// Week1 각 질문의 라벨 + "이 질문이 무엇을 확인하려는지(좋은 답의 조건)".
// 의도를 AI에 함께 주어야, 답변이 그 의도를 충족했는지 비교해 피드백할 수 있다.
const WEEK1_QUESTIONS: { key: string; label: string; intent: string }[] = [
  {
    key: "q2_expertise",
    label: "Q2. 이 일에서 나의 전문성을 보여줄 수 있는 것들",
    intent:
      "판매자를 왜 신뢰할 수 있는지 근거(경험·자격·실적·과정)를 구체적으로 끌어내는 질문. '열심히 했다'식 막연한 진술이 아니라, 소비자가 믿을 만한 구체적 증거가 있어야 좋은 답이다.",
  },
  {
    key: "q3_customer_problem",
    label: "Q3. 내 소비자가 지금 겪고 있는 문제·불편",
    intent:
      "타겟 소비자가 실제로 겪는 구체적이고 절실한 문제를 정의하는 질문. 표면적·일반적 진술이 아니라 상황이 눈에 그려지는 구체적 고통이어야 한다.",
  },
  {
    key: "q4_persona",
    label: "Q4. 그 사람은 누구인가요? 하루는 어떤 모습인가요?",
    intent:
      "소비자를 '한 명의 살아있는 인물'로 구체화(나이·상황·하루 일과·감정)하는 질문. 인구통계 나열이 아니라 장면이 그려지는 페르소나여야 한다. Q3의 문제를 겪는 그 사람과 일치해야 한다.",
  },
  {
    key: "q5_solution",
    label: "Q5. 나는 그 문제를 어떻게 해결하나요?",
    intent:
      "Q3의 문제와 내 상품/서비스가 논리적으로 연결되는지 보는 질문. 문제→해결의 인과가 분명하고, 어떻게 해결하는지 구체적 방법이 드러나야 한다.",
  },
  {
    key: "q7_search",
    label: "Q6. 사기 직전에 검색할 단어·질문",
    intent:
      "구매 직전 소비자의 검색 의도를 파악해 콘텐츠·프로필 키워드로 활용하려는 질문. 실제 사람들이 칠 법한 구체적인 검색어/질문 형태여야 한다.",
  },
  {
    key: "q8_solved_experiences",
    label: "Q7. 소비자들의 문제를 해결했던 나의 경험들",
    intent:
      "과거에 실제로 소비자 문제를 해결한 사례(증거)를 끌어내는 질문. 구체적 상황·행동·결과가 담긴 스토리여야 신뢰가 생긴다. Q2의 전문성과 이어지면 좋다.",
  },
  {
    key: "q9_customer_change",
    label: "Q8. 내 상품·서비스를 경험한 뒤 달라진 고객의 모습",
    intent:
      "고객의 before→after 변화를 구체적으로 그리는 질문. 측정 가능하거나 장면이 그려지는 변화여야 후킹 콘텐츠·후기로 이어진다.",
  },
  {
    key: "q10_unmet_problem",
    label: "Q9. 다른 판매자들이 채워주지 못하는 소비자의 문제",
    intent:
      "경쟁자가 못 채우는 지점 = 나의 차별점을 찾는 질문. 시장의 빈틈과 내 강점이 만나는 구체적 포인트여야 한다.",
  },
];

interface Week1FormData {
  kind?: string;
  products?: { name?: string; description?: string }[];
  answers?: Record<string, string>;
  people?: { name?: string; instagramUrl?: string; followerRange?: string; learning?: string }[];
  landingUrl?: string;
  highlights?: Record<string, string[]>;
}

/**
 * 제출물을 "질문 + 질문의 의도 + 학생 답변" 형태로 직렬화.
 * AI가 각 질문의 의도와 답변을 비교해 항목별 피드백을 줄 수 있게 한다.
 * week1은 구조화 formData를, 그 외 주차는 자유 텍스트 content를 사용.
 */
export function buildSubmissionTranscript(content: string, formData: unknown): string {
  const fd = (formData ?? null) as Week1FormData | null;

  if (fd?.kind === "week1_product_customer") {
    const blocks: string[] = [];

    const products = (fd.products ?? []).filter((p) => p?.name || p?.description);
    const productAnswer =
      products.length > 0
        ? products
            .map((p, i) => `  ${i + 1}) ${p.name || "(이름 미입력)"}${p.description ? ` — ${p.description}` : ""}`)
            .join("\n")
        : "(미작성)";
    blocks.push(
      [
        "Q1. 팔고 싶은 것 · 팔고 있는 것",
        "· 질문의 의도: 무엇을 파는지(상품/서비스)가 구체적으로 정의됐는지 본다. 두루뭉술하지 않고 명확해야 이후 모든 답의 기준이 된다.",
        `· 제출한 답변:\n${productAnswer}`,
      ].join("\n")
    );

    for (const q of WEEK1_QUESTIONS) {
      const a = (fd.answers?.[q.key] || "").trim();
      blocks.push(
        [q.label, `· 질문의 의도: ${q.intent}`, `· 제출한 답변: ${a || "(미작성)"}`].join("\n")
      );
    }

    const people = (fd.people ?? []).filter((p) => p?.name || p?.instagramUrl);
    if (people.length) {
      const lines = people
        .map(
          (p, i) =>
            `  ${i + 1}) ${p.name || "(이름없음)"}` +
            `${p.followerRange ? ` / 팔로워 ${p.followerRange}` : ""}` +
            `${p.learning ? ` / 배울 점: ${p.learning}` : ""}`
        )
        .join("\n");
      blocks.push(
        [
          `벤치마킹 · 관련 인물 조사 (${people.length}명)`,
          "· 질문의 의도: 내 시장의 레퍼런스를 관찰해 배울 점을 찾는다. 단순 나열이 아니라 '무엇을 왜 배울지'가 있어야 한다.",
          `· 제출한 답변:\n${lines}`,
        ].join("\n")
      );
    }

    if (fd.landingUrl) blocks.push(`랜딩 페이지 URL: ${fd.landingUrl}`);
    if (fd.highlights) {
      const hs = Object.entries(fd.highlights).filter(([, u]) => (u?.length ?? 0) > 0);
      if (hs.length) blocks.push(`하이라이트 제출: ${hs.map(([k, u]) => `${k}(${u.length}장)`).join(", ")}`);
    }

    return blocks.join("\n\n").trim();
  }

  // 자유 서술형(그 외 주차)
  return (content || "").trim();
}

const SYSTEM_PROMPT = `당신은 인스타그램 마케팅 교육 브랜드 "팁스타그램"의 5주 챌린지 강사입니다.
수강생이 제출한 이번 주 숙제를 읽고, 강사 입장에서 **항목별로** 꼼꼼한 피드백을 작성합니다.

가장 중요한 원칙 — 질문의 의도와 답변을 비교하라:
- 각 항목에는 "질문의 의도(좋은 답의 조건)"가 함께 주어진다. 반드시 그 의도와 학생의 답변을 비교해서,
  이 답변이 질문이 원하는 바를 충족했는지 판단하고 그 근거를 말한다.
- 충족했다면 어디가 좋은지 구체적으로, 부족하다면 "무엇이 왜 부족한지 → 어떻게 고치면 되는지"를 예시와 함께 준다.
- 전체 제출을 먼저 통으로 이해한 뒤(예: Q3의 문제와 Q4의 페르소나, Q5의 해결이 서로 일관되는지) 항목 간 연결도 짚어준다.

작성 원칙:
- 한국어로, 따뜻하지만 구체적이고 실행 가능하게. 두루뭉술한 칭찬/지적 금지 — 학생이 쓴 문장·표현을 인용하며 짚는다.
- 인스타그램 마케팅(소비자 문제 정의, 페르소나, 후킹, 프로필·콘텐츠 전략) 관점에서 조언한다.

출력 형식(반드시 지킬 것):
- 학생이 답한 각 항목마다 개별 피드백. 첫 줄에 "Q2. (질문 요약)"을 쓰고, 다음 줄부터 2~4문장 피드백.
- 답이 비었거나 "(미작성)"이면 짧게: 왜 중요한지 + 무엇을 채우면 되는지 한두 문장으로 유도.
- 자유 서술형(구조화 답변이 아닌) 제출이면, 학생이 말한 핵심 포인트를 2~4개로 나눠 각각 피드백한다.
- 마지막에 "총평:" 으로 시작하는 3~4문장: 전체적으로 잘한 점, 항목 간 일관성, 다음 주 한 줄 액션.
- 각 항목·총평 사이는 빈 줄 하나로 구분. 마크다운 기호(#, *, - 등) 쓰지 말고 자연스러운 문장으로.
- 서두("아래는 피드백입니다" 등)나 메타 설명 없이 피드백 본문만 출력.`;

export function isAiFeedbackConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function generateFeedbackText(opts: {
  weekIndex: number;
  weekTitle?: string | null;
  weekContext?: string | null;
  studentName?: string | null;
  content: string;
  formData?: unknown;
}): Promise<string | null> {
  if (!isAiFeedbackConfigured()) return null;
  const client = new Anthropic();

  const transcript = buildSubmissionTranscript(opts.content, opts.formData);

  const prompt = `[Week ${opts.weekIndex}${opts.weekTitle ? ` · ${opts.weekTitle}` : ""}]${
    opts.studentName ? ` 수강생: ${opts.studentName}` : ""
  }
${opts.weekContext ? `\n이번 주 안내(강사가 낸 편지/방향):\n${opts.weekContext.trim()}\n` : ""}
아래는 수강생이 제출한 숙제입니다. 각 항목은 "질문 · 질문의 의도 · 학생의 답변" 순서입니다.
먼저 전체를 이해한 뒤, 각 질문의 의도와 답변을 비교해 항목별 강사 피드백을 작성해 주세요.
════════════════════
${transcript || "(제출 내용이 비어 있음)"}
════════════════════`;

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
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
