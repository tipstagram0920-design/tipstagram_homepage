import crypto from "node:crypto";

function getSecret() {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-unsubscribe-secret-change-me"
  );
}

export function makeUnsubscribeToken(email: string) {
  const secret = getSecret();
  const norm = email.trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", secret).update(norm).digest("hex").slice(0, 24);
  const enc = Buffer.from(norm).toString("base64url");
  return `${enc}.${hmac}`;
}

export function parseUnsubscribeToken(token: string): string | null {
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return null;
  let email: string;
  try {
    email = Buffer.from(enc, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(email)
    .digest("hex")
    .slice(0, 24);
  if (expected !== sig) return null;
  return email;
}
