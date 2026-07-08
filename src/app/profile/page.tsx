import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { User as UserIcon, Mail, Calendar, ShoppingBag, BookOpen, LogOut } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      purchases: {
        include: { product: { select: { id: true, slug: true, title: true, thumbnail: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) redirect("/login");

  const totalSpent = user.purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">내 프로필</h1>
          <p className="mt-1 text-sm text-neutral-500">계정 정보와 구매·수강 이력을 확인하세요.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* 프로필 카드 */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 sm:col-span-1">
              <div className="mb-4 flex items-center justify-center">
                <div className="ig-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </div>
              </div>
              <p className="text-center text-lg font-bold text-neutral-900">{user.name || "이름 없음"}</p>
              {user.role === "ADMIN" && (
                <p className="mt-1 text-center text-xs font-bold text-pink-600">관리자</p>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>가입일 {formatDate(user.createdAt)}</span>
                </div>
                {user.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {user.tags.map((t) => (
                      <span key={t} className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <LogoutButton />
              </div>
            </div>

            {/* 통계 + 구매 이력 */}
            <div className="sm:col-span-2 space-y-4">
              {/* 통계 카드 3장 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-neutral-100 bg-white p-4">
                  <p className="text-xs font-semibold text-neutral-500">구매 상품</p>
                  <p className="mt-1 text-xl font-black text-neutral-900">{user.purchases.length}</p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-white p-4">
                  <p className="text-xs font-semibold text-neutral-500">총 결제</p>
                  <p className="mt-1 text-xl font-black text-neutral-900">{formatPrice(totalSpent)}</p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-white p-4">
                  <p className="text-xs font-semibold text-neutral-500">내 강의실</p>
                  <Link href="/classroom" className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-pink-600 hover:text-pink-700">
                    바로 가기 →
                  </Link>
                </div>
              </div>

              {/* 구매 이력 */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900 inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-neutral-400" /> 구매 이력
                  </h2>
                  {user.purchases.length > 0 && (
                    <Link href="/classroom" className="text-xs font-semibold text-pink-600 hover:text-pink-700">
                      강의실 열기 →
                    </Link>
                  )}
                </div>

                {user.purchases.length === 0 ? (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="text-sm text-neutral-500">아직 구매한 상품이 없어요.</p>
                    <Link href="/courses" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700">
                      강의 둘러보기 →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.purchases.map((p) => (
                      <Link
                        key={p.id}
                        href={`/classroom/${p.product.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3 hover:border-pink-300 hover:bg-pink-50/30 transition-colors"
                      >
                        {p.product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.product.thumbnail}
                            alt={p.product.title}
                            className="h-14 w-20 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-14 w-20 shrink-0 rounded-lg bg-neutral-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-900">{p.product.title}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatDate(p.createdAt)} · {p.amount === 0 ? "번들 보너스" : formatPrice(p.amount)}
                          </p>
                        </div>
                        <BookOpen className="h-4 w-4 shrink-0 text-neutral-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
