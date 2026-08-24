import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";

/**
 * 비밀번호 재설정 토큰.
 * NextAuth의 VerificationToken 테이블을 재사용한다(스키마 변경 없음).
 * - identifier: `password-reset:<email>`
 * - token: 원문이 아닌 SHA-256 해시를 저장 → DB가 유출돼도 링크를 재현할 수 없음
 */
const PREFIX = "password-reset:";
const TTL_MINUTES = 60;

export const RESET_TTL_MINUTES = TTL_MINUTES;

export function normalizeEmail(email: string) {
  return String(email).trim().toLowerCase();
}

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/** 재설정 토큰 발급. 기존 미사용 토큰은 폐기한다. 반환값은 메일 링크에 넣을 원문 토큰. */
export async function createResetToken(email: string): Promise<string> {
  const identifier = PREFIX + normalizeEmail(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const raw = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(raw),
      expires: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
    },
  });
  return raw;
}

/** 토큰 검증. 유효하면 해당 이메일을 반환, 아니면 null. 소비하지는 않는다. */
export async function verifyResetToken(raw: string): Promise<string | null> {
  if (!raw) return null;
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(raw) },
  });
  if (!record || !record.identifier.startsWith(PREFIX)) return null;
  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { token: record.token } });
    return null;
  }
  return record.identifier.slice(PREFIX.length);
}

/** 토큰 폐기(1회용 보장). */
export async function consumeResetToken(raw: string) {
  await prisma.verificationToken.deleteMany({ where: { token: hashToken(raw) } });
}

function baseUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    `https://${COMPANY.domain}`
  ).replace(/\/$/, "");
}

export function buildResetEmail(rawToken: string, name?: string | null) {
  const link = `${baseUrl()}/reset-password?token=${rawToken}`;
  const hello = name ? `${name}님,` : "안녕하세요,";
  return {
    subject: `[${COMPANY.serviceName}] 비밀번호 재설정 안내`,
    html: `
<div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#171717">
  <p style="font-size:18px;font-weight:800;margin:0 0 24px">${COMPANY.serviceName}</p>
  <p style="font-size:15px;line-height:1.7;margin:0 0 8px">${hello}</p>
  <p style="font-size:15px;line-height:1.7;margin:0 0 24px">
    비밀번호 재설정 요청이 접수되었습니다. 아래 버튼을 눌러 새 비밀번호를 설정해 주세요.
  </p>
  <a href="${link}"
     style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(90deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:700;font-size:15px;text-decoration:none">
    비밀번호 재설정하기
  </a>
  <p style="font-size:13px;line-height:1.7;color:#737373;margin:24px 0 0">
    이 링크는 <strong>${TTL_MINUTES}분간</strong>만 유효하며 한 번만 사용할 수 있습니다.<br />
    본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.
  </p>
  <p style="font-size:12px;color:#a3a3a3;margin:24px 0 0;word-break:break-all">
    버튼이 안 눌리면 아래 주소를 복사해 주소창에 붙여넣어 주세요.<br />${link}
  </p>
</div>`.trim(),
  };
}
