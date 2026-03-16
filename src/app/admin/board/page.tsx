import { prisma } from "@/lib/prisma";
import { BoardManageClient } from "./BoardManageClient";

export default async function AdminBoardPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">게시판 관리</h1>
      <BoardManageClient posts={posts} />
    </div>
  );
}
