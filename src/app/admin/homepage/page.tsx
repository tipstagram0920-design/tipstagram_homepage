import { prisma } from "@/lib/prisma";
import HomepageEditor from "./HomepageEditor";

export default async function HomepagePage() {
  const raw = await prisma.homepageBlock.findMany({
    orderBy: [{ section: "asc" }, { order: "asc" }],
  });
  const blocks = raw.map(b => ({
    id: b.id,
    section: b.section,
    order: b.order,
    isActive: b.isActive,
    data: JSON.parse(b.data) as Record<string, string | number>,
  }));

  return <HomepageEditor initial={blocks} />;
}
