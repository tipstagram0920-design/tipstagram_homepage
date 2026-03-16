import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { PostEditor } from "./PostEditor";

export default async function WritePostPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/board/write");

  const { id } = await searchParams;
  let post = null;

  if (id) {
    post = await prisma.post.findFirst({
      where: { id, authorId: session.user.id },
    }).catch(() => null);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-black text-neutral-900 mb-8">
            {post ? "글 수정" : "새 글 작성"}
          </h1>
          <PostEditor post={post} />
        </div>
      </main>
    </div>
  );
}
