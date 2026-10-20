import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { formatPrice } from "@/lib/utils";
import { formatKstHuman } from "@/lib/kst";
import { CHALLENGE_SLUGS, findCohortForNewPurchase } from "@/lib/challenge-enrollment";

/**
 * 구매 완료 안내(이메일 + 문자) 발송.
 *
 * 문안은 EmailTemplate(type="purchase_confirmation") 에 저장되고 어드민에서 고친다.
 * 기수 정보({{openChatUrl}} 등)는 **문안에 박아두지 않고 발송 시점에 DB에서 읽어 채운다.**
 * 기수가 바뀌어도 오픈채팅방 URL만 기수 편집 화면에서 바꾸면 안내 메시지가 따라간다.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

/** 문안에 쓸 수 있는 변수 목록 (어드민 안내와 같은 값을 쓴다) */
export const PURCHASE_VARIABLES = [
  "{{name}}",
  "{{product}}",
  "{{amount}}",
  "{{orderId}}",
] as const;

/** 5주 챌린지 계열 구매에서만 채워지는 변수 */
export const CHALLENGE_VARIABLES = [
  "{{openChatUrl}}",
  "{{cohortName}}",
  "{{week1Date}}",
  "{{challengeUrl}}",
] as const;

export interface PurchaseNotifyInput {
  userId: string;
  productId: string;
  orderId: string;
  amount: number;
  contactId?: string | null;
}

/** 치환용 변수 묶음을 만든다. 챌린지 계열이면 기수 정보까지 붙는다. */
async function buildVariables(input: {
  userName: string | null;
  productTitle: string;
  productSlug: string;
  orderId: string;
  amount: number;
  userId: string;
}): Promise<Record<string, string>> {
  const vars: Record<string, string> = {
    "{{name}}": input.userName || "회원",
    "{{product}}": input.productTitle,
    "{{amount}}": formatPrice(input.amount),
    "{{orderId}}": input.orderId,
    // 챌린지가 아닌 상품에서도 변수를 그대로 노출하지 않도록 기본값은 빈 문자열
    "{{openChatUrl}}": "",
    "{{cohortName}}": "",
    "{{week1Date}}": "",
    "{{challengeUrl}}": "",
  };

  if (!CHALLENGE_SLUGS.includes(input.productSlug)) return vars;

  // 이 구매자가 들어갈 기수 = 아직 시작 안 한 활성 기수 중 가장 이른 것
  const target = await findCohortForNewPurchase(input.userId);
  if (!target) return vars;
  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: target.id },
    select: { id: true, name: true, week1StartAt: true, openChatUrl: true },
  });
  if (!cohort) return vars;

  vars["{{openChatUrl}}"] = cohort.openChatUrl ?? "";
  vars["{{cohortName}}"] = cohort.name;
  vars["{{week1Date}}"] = formatKstHuman(cohort.week1StartAt);
  vars["{{challengeUrl}}"] = `${SITE}/challenge/${cohort.id}`;
  return vars;
}

function render(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(k, v), text);
}

/**
 * 구매 완료 안내를 보낸다. 템플릿이 없거나 비활성이면 조용히 아무것도 안 한다.
 * 결제 성공을 막지 않도록 실패는 삼키고 결과만 돌려준다.
 */
export async function sendPurchaseNotification(input: PurchaseNotifyInput): Promise<{
  email: "sent" | "skipped" | "failed";
  sms: "sent" | "skipped" | "failed";
  reason?: string;
}> {
  try {
    const [user, product] = await Promise.all([
      prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, name: true },
      }),
      prisma.product.findUnique({
        where: { id: input.productId },
        select: { title: true, slug: true },
      }),
    ]);
    if (!user || !product) return { email: "skipped", sms: "skipped", reason: "사용자·상품 없음" };

    // 상품 전용 문안이 있으면 그것, 없으면 공통 문안.
    // 한 번의 쿼리로 orderBy 로 고르면 안 된다 — Postgres 는 DESC 에서 NULL 을 먼저 놓기 때문에
    // 공통(productId=null) 문안이 항상 이긴다. 그래서 전용 → 공통 순서로 나눠서 찾는다.
    const template =
      (await prisma.emailTemplate.findFirst({
        where: { type: "purchase_confirmation", isActive: true, productId: input.productId },
      })) ??
      (await prisma.emailTemplate.findFirst({
        where: { type: "purchase_confirmation", isActive: true, productId: null },
      }));
    if (!template) return { email: "skipped", sms: "skipped", reason: "활성 문안 없음" };

    const vars = await buildVariables({
      userName: user.name,
      productTitle: product.title,
      productSlug: product.slug,
      orderId: input.orderId,
      amount: input.amount,
      userId: input.userId,
    });

    let email: "sent" | "skipped" | "failed" = "skipped";
    let sms: "sent" | "skipped" | "failed" = "skipped";

    // ── 이메일
    const emailRes = await sendMessage({
      to: user.email,
      contactId: input.contactId ?? undefined,
      subject: render(template.subject, vars),
      body: render(template.html, vars),
      templateKey: "purchase_confirmation",
      transactional: true,
    }).catch(() => ({ ok: false }));
    email = emailRes.ok ? "sent" : "failed";

    // ── 문자 (문안이 비어 있으면 안 보낸다)
    const smsBody = (template.smsBody ?? "").trim();
    if (smsBody) {
      const phone = input.contactId
        ? (
            await prisma.contact.findUnique({
              where: { id: input.contactId },
              select: { phone: true },
            })
          )?.phone
        : null;
      if (!phone) {
        sms = "skipped";
      } else {
        const smsRes = await sendMessage({
          to: phone,
          contactId: input.contactId ?? undefined,
          body: render(smsBody, vars),
          templateKey: "purchase_confirmation_sms",
          channel: "sms",
          transactional: true,
        }).catch(() => ({ ok: false }));
        sms = smsRes.ok ? "sent" : "failed";
      }
    }

    return { email, sms };
  } catch (e) {
    console.error("[purchase-notify] 발송 실패:", (e as Error).message);
    return { email: "failed", sms: "failed", reason: "예외" };
  }
}
