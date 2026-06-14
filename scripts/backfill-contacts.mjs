/**
 * 기존 User / LiveSignup / Purchase / Progress 데이터를
 * Contact + Event 모델로 백필합니다. idempotent (여러 번 돌려도 안전).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function normEmail(e) {
  return e?.trim().toLowerCase() || null;
}

async function ensureContact({ email, name, phone, source, firstSeenAt }) {
  const key = normEmail(email);
  if (!key) return null;
  const existing = await prisma.contact.findUnique({ where: { email: key } });
  if (existing) {
    // source 우선순위: 가장 이른 것 유지
    const patch = {};
    if (!existing.name && name) patch.name = name;
    if (!existing.phone && phone) patch.phone = phone;
    if (Object.keys(patch).length) {
      return prisma.contact.update({ where: { id: existing.id }, data: patch });
    }
    return existing;
  }
  return prisma.contact.create({
    data: {
      email: key,
      name: name ?? null,
      phone: phone ?? null,
      source: source ?? "backfill",
      firstSeenAt: firstSeenAt ?? new Date(),
    },
  });
}

async function logEventOnce({ contactId, type, occurredAt, payload }) {
  // idempotency: 같은 contact + type + occurredAt 이면 스킵
  const dup = await prisma.event.findFirst({
    where: { contactId, type, occurredAt },
  });
  if (dup) return dup;
  return prisma.event.create({
    data: { contactId, type, occurredAt: occurredAt ?? new Date(), payload },
  });
}

// 1) Users
const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
console.log(`Users: ${users.length}`);
for (const u of users) {
  const c = await ensureContact({
    email: u.email,
    name: u.name,
    source: "register",
    firstSeenAt: u.createdAt,
  });
  if (!c) continue;
  if (u.contactId !== c.id) {
    await prisma.user.update({ where: { id: u.id }, data: { contactId: c.id } });
  }
  await logEventOnce({ contactId: c.id, type: "register", occurredAt: u.createdAt, payload: { userId: u.id } });
}

// 2) LiveSignups
const liveSignups = await prisma.liveSignup.findMany({ orderBy: { createdAt: "asc" } });
console.log(`LiveSignups: ${liveSignups.length}`);
for (const s of liveSignups) {
  const c = await ensureContact({
    email: s.email,
    name: s.name,
    source: "live_signup",
    firstSeenAt: s.createdAt,
  });
  if (!c) continue;
  if (s.contactId !== c.id) {
    await prisma.liveSignup.update({ where: { id: s.id }, data: { contactId: c.id } });
  }
  await logEventOnce({ contactId: c.id, type: "live_signup", occurredAt: s.createdAt });
}

// 3) Purchases
const purchases = await prisma.purchase.findMany({
  include: { user: { select: { contactId: true, email: true } }, product: { select: { title: true } } },
  orderBy: { createdAt: "asc" },
});
console.log(`Purchases: ${purchases.length}`);
for (const p of purchases) {
  const cid = p.user.contactId ?? (await ensureContact({ email: p.user.email, source: "register" }))?.id;
  if (!cid) continue;
  await logEventOnce({
    contactId: cid,
    type: "purchase",
    occurredAt: p.createdAt,
    payload: { productId: p.productId, productTitle: p.product?.title, amount: p.amount, orderId: p.orderId },
  });
}

// 4) Progress (완료된 것만)
const progress = await prisma.progress.findMany({
  where: { completed: true },
  include: { user: { select: { contactId: true } }, lesson: { select: { title: true } } },
});
console.log(`Completed progress: ${progress.length}`);
for (const pr of progress) {
  if (!pr.user.contactId) continue;
  await logEventOnce({
    contactId: pr.user.contactId,
    type: "lesson_complete",
    occurredAt: pr.updatedAt,
    payload: { lessonId: pr.lessonId, lessonTitle: pr.lesson?.title },
  });
}

// 5) 카운터 캐시 재계산
console.log("Recomputing counter caches...");
const contacts = await prisma.contact.findMany({ select: { id: true } });
for (const c of contacts) {
  const [signupCount, purchaseAgg] = await Promise.all([
    prisma.liveSignup.count({ where: { contactId: c.id } }),
    prisma.user.findUnique({
      where: { contactId: c.id },
      include: { purchases: { select: { amount: true } } },
    }),
  ]);
  const purchases = purchaseAgg?.purchases ?? [];
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
  await prisma.contact.update({
    where: { id: c.id },
    data: {
      liveSignupCount: signupCount,
      purchaseCount: purchases.length,
      totalSpent,
    },
  });
}

const finalContacts = await prisma.contact.count();
const finalEvents = await prisma.event.count();
console.log(`\n✓ 백필 완료: Contact ${finalContacts}건, Event ${finalEvents}건`);

await prisma.$disconnect();
