import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PenLine, Eye } from "lucide-react";

async function getPosts() {
  return await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  }).catch(() => []);
}

export default async function BoardPage() {
  const [posts, session] = await Promise.all([getPosts(), auth()]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">게시판</h1>
              <p className="text-neutral-500 mt-1">자유롭게 이야기를 나눠보세요</p>
            </div>
            {session && (
              <Link
                href="/board/write"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl ig-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <PenLine className="w-4 h-4" />
                글쓰기
              </Link>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-24 bg-neutral-50 rounded-2xl">
              <p className="text-neutral-500">아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-100 divide-y divide-neutral-100 overflow-hidden">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/board/${post.id}`}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                      <span>{post.author.name}</span>
                      <span>·</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{post.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
