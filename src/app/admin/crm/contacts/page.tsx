import { prisma } from "@/lib/prisma";
import { ContactsClient } from "./ContactsClient";

export const dynamic = "force-dynamic";

async function getContacts() {
  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 1000,
      include: {
        user: { select: { id: true, role: true, tags: true } },
        _count: { select: { events: true, liveSignups: true } },
      },
    }),
    prisma.contact.count(),
  ]);
  const items = contacts.map((c) => ({
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
  return { items, totalCount };
}

export default async function ContactsPage() {
  const { items, totalCount } = await getContacts();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">컨택트</h1>
        <p className="text-sm text-neutral-500 mt-1">
          전체 <strong className="text-neutral-800">{totalCount.toLocaleString()}명</strong>
          {totalCount > items.length && (
            <span className="text-neutral-400"> · 최근 활동순 상위 {items.length.toLocaleString()}명 로드</span>
          )}
        </p>
      </div>
      <ContactsClient initial={items} totalCount={totalCount} />
    </div>
  );
}
