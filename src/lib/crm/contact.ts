import { prisma } from "@/lib/prisma";

function normEmail(e: string | null | undefined) {
  return e?.trim().toLowerCase() || null;
}

/**
 * 이메일 기준으로 Contact를 upsert. 같은 이메일 있으면 누락된 필드만 채움.
 * source 우선순위: 기존 값 유지(첫 진입 source 보존).
 */
export async function upsertContactByEmail(args: {
  email: string;
  name?: string | null;
  phone?: string | null;
  source?: string;
}) {
  const email = normEmail(args.email);
  if (!email) throw new Error("upsertContactByEmail: email required");

  const existing = await prisma.contact.findUnique({ where: { email } });
  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.name && args.name) patch.name = args.name;
    if (!existing.phone && args.phone) patch.phone = args.phone;
    if (Object.keys(patch).length > 0) {
      return prisma.contact.update({ where: { id: existing.id }, data: patch });
    }
    return existing;
  }
  return prisma.contact.create({
    data: {
      email,
      name: args.name ?? null,
      phone: args.phone ?? null,
      source: args.source ?? null,
    },
  });
}

/**
 * 두 Contact를 합침. primary를 남기고 secondary의 events/messageLogs/liveSignups/user 를 옮김.
 */
export async function mergeContacts(primaryId: string, secondaryId: string) {
  if (primaryId === secondaryId) return;
  await prisma.$transaction(async (tx) => {
    await tx.event.updateMany({ where: { contactId: secondaryId }, data: { contactId: primaryId } });
    await tx.messageLog.updateMany({ where: { contactId: secondaryId }, data: { contactId: primaryId } });
    await tx.liveSignup.updateMany({ where: { contactId: secondaryId }, data: { contactId: primaryId } });
    await tx.workflowRun.updateMany({ where: { contactId: secondaryId }, data: { contactId: primaryId } });

    // User는 contactId가 unique라서 직접 update
    const user = await tx.user.findUnique({ where: { contactId: secondaryId } });
    if (user) {
      const primaryUser = await tx.user.findUnique({ where: { contactId: primaryId } });
      if (!primaryUser) {
        await tx.user.update({ where: { id: user.id }, data: { contactId: primaryId } });
      } else {
        // 양쪽 다 User가 있으면 secondary user의 contactId만 끊음 (수동 검토 필요)
        await tx.user.update({ where: { id: user.id }, data: { contactId: null } });
      }
    }

    // 카운터 합산
    const [p, s] = await Promise.all([
      tx.contact.findUnique({ where: { id: primaryId } }),
      tx.contact.findUnique({ where: { id: secondaryId } }),
    ]);
    if (p && s) {
      await tx.contact.update({
        where: { id: primaryId },
        data: {
          liveSignupCount: p.liveSignupCount + s.liveSignupCount,
          purchaseCount: p.purchaseCount + s.purchaseCount,
          totalSpent: p.totalSpent + s.totalSpent,
          note: [p.note, s.note].filter(Boolean).join("\n\n--- merged ---\n\n") || null,
        },
      });
    }

    await tx.contact.delete({ where: { id: secondaryId } });
  });
}
