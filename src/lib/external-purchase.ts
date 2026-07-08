import crypto from 'crypto';

/**
 * 외부 결제 대행 (ReelSpy 페이플 PG 사용) — HMAC 서명/검증
 *
 * ReelSpy(reelspy.vercel.app)와 같은 EXTERNAL_PURCHASE_SECRET을 공유한다.
 * 이 파일은 ReelSpy 프로젝트에도 동일한 사본으로 존재해야 한다.
 * 위치: reelspy/src/lib/external-purchase.ts
 *
 * 형태: base64url(header).base64url(sig), 최소 JWT-lite 구현
 */

export interface PurchaseTokenPayload {
  email: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  amount: number;
  orderId: string;
  iat: number;
  exp: number;
}

const b64url = (buf: Buffer | string): string =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64urlDecode = (s: string): Buffer =>
  Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

function getSecret(): string {
  const s = process.env.EXTERNAL_PURCHASE_SECRET;
  if (!s) throw new Error('EXTERNAL_PURCHASE_SECRET 미설정');
  return s;
}

export function signPurchaseToken(
  payload: Omit<PurchaseTokenPayload, 'iat' | 'exp'>,
  expMinutes = 30,
): string {
  const now = Math.floor(Date.now() / 1000);
  const full: PurchaseTokenPayload = { ...payload, iat: now, exp: now + expMinutes * 60 };
  const body = b64url(JSON.stringify(full));
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyPurchaseToken(token: string): PurchaseTokenPayload {
  const [body, sig] = token.split('.');
  if (!body || !sig) throw new Error('토큰 형식 오류');
  const expected = crypto.createHmac('sha256', getSecret()).update(body).digest();
  const provided = b64urlDecode(sig);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    throw new Error('서명 검증 실패');
  }
  const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as PurchaseTokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('토큰 만료');
  }
  return payload;
}

export function signWebhookBody(bodyJson: string): string {
  return crypto.createHmac('sha256', getSecret()).update(bodyJson).digest('hex');
}

export function verifyWebhookBody(bodyJson: string, signatureHex: string): boolean {
  const expected = crypto.createHmac('sha256', getSecret()).update(bodyJson).digest('hex');
  if (expected.length !== signatureHex.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signatureHex, 'hex'));
}
