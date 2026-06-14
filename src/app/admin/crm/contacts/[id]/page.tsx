import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactDetailClient } from "./ContactDetailClient";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          tags: true,
          createdAt: true,
          purchases: {
            include: { product: { select: { title: true, slug: true } } },
            orderBy: { createdAt: "desc" },
          },
          progresses: {
            where: { completed: true },
            include: { lesson: { select: { title: true } } },
            orderBy: { updatedAt: "desc" },
            take: 30,
          },
        },
      },
      liveSignups: { orderBy: { createdAt: "desc" }, take: 10 },
      events: { orderBy: { occurredAt: "desc" }, take: 50 },
    },
  });

  if (!contact) notFound();

  const messages = await prisma.messageLog.findMany({
    where: { contactId: id },
    orderBy: { sentAt: "desc" },
    take: 30,
  });

  return (
    <ContactDetailClient
      contact={{
        id: contact.id,
        email: contact.email,
        name: contact.name,
        phone: contact.phone,
        source: contact.source,
        note: contact.note,
        firstSeenAt: contact.firstSeenAt.toISOString(),
        lastSeenAt: contact.lastSeenAt.toISOString(),
        consentEmail: contact.consentEmail,
        consentSms: contact.consentSms,
        unsubscribedAt: contact.unsubscribedAt?.toISOString() ?? null,
        liveSignupCount: contact.liveSignupCount,
        purchaseCount: contact.purchaseCount,
        totalSpent: contact.totalSpent,
        userRole: contact.user?.role ?? null,
        userTags: contact.user?.tags ?? [],
        userId: contact.user?.id ?? null,
      }}
      events={contact.events.map((e) => ({
        id: e.id,
        type: e.type,
        payload: (e.payload as Record<string, unknown>) ?? {},
        occurredAt: e.occurredAt.toISOString(),
      }))}
      purchases={contact.user?.purchases.map((p) => ({
        id: p.id,
        productTitle: p.product.title,
        productSlug: p.product.slug,
        amount: p.amount,
        orderId: p.orderId,
        createdAt: p.createdAt.toISOString(),
      })) ?? []}
      completedLessons={contact.user?.progresses.map((p) => ({
        id: p.id,
        title: p.lesson.title,
        completedAt: p.updatedAt.toISOString(),
      })) ?? []}
      messages={messages.map((m) => ({
        id: m.id,
        channel: m.channel,
        provider: m.provider,
        to: m.to,
        subject: m.subject,
        status: m.status,
        error: m.error,
        templateKey: m.templateKey,
        sentAt: m.sentAt.toISOString(),
      }))}
    />
  );
}
