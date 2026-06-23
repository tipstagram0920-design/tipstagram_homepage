import { prisma } from "@/lib/prisma";
import { ContactsClient } from "./ContactsClient";

export const dynamic = "force-dynamic";

async function getContacts() {
  const contacts = await prisma.contact.findMany({
    orderBy: { lastSeenAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, role: true, tags: true } },
      _count: { select: { events: true, liveSignups: true } },
    },
  });
  return contacts.map((c) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    source: c.source,
    firstSeenAt: c.firstSeenAt.toISOString(),
    lastSeenAt: c.lastSeenAt.toISOString(),
    liveSignupCount: c.liveSignupCount,
    purchaseCount: c.purchaseCount,
    totalSpent: c.totalSpent,
    unsubscribed: !!c.unsubscribedAt,
    hasUser: !!c.user,
    userRole: c.user?.role ?? null,
    userTags: Array.from(new Set([...(c.tags ?? []), ...(c.user?.tags ?? [])])),
    eventCount: c._count.events,
  }));
}

export default async function ContactsPage() {
  const contacts = await getContacts();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">컨택트</h1>
        <p className="text-sm text-neutral-500 mt-1">전체 {contacts.length.toLocaleString()}명 · 최근 활동순</p>
      </div>
      <ContactsClient initial={contacts} />
    </div>
  );
}
