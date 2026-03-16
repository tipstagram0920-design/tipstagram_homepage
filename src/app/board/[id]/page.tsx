import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeletePostButton } from "./DeletePostButton";

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (post) {
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {});
  }

  return post;
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, session] = await Promise.all([getPost(id).catch(() => null), auth()]);

  if (!post) notFound();

  const isAuthor = session?.user?.id === post.author.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/board" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> 목록으로
          </Link>

          <article className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center justify-between mt-4 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <span className="font-medium text-neutral-600">{post.author.name}</span>
                  <span>·</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                {(isAuthor || isAdmin) && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/board/write?id=${post.id}`}
                      className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                    >
                      수정
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                )}
              </div>

              <div
                className="tiptap-content mt-6 text-neutral-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
