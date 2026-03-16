import { prisma } from "@/lib/prisma";
import { PagesManageClient } from "./PagesManageClient";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">페이지 관리</h1>
      <PagesManageClient pages={pages} />
    </div>
  );
}
