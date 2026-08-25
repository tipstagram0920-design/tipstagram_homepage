import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const COURSES_HIDDEN = false;

/**
 * 가운데(추천) 자리에 놓을 상품.
 * 순서 자체는 Product.order 로 정하고(부스터 → 챌린지 → 컨설팅), 강조는 여기서 고른다.
 * 위치(index 1)로 잡지 않는 이유: 상품이 하나 늘면 엉뚱한 카드가 추천이 된다.
 */
const RECOMMENDED_SLUG = "5-week-challenge";

async function getProducts() {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function CoursesPage() {
  if (COURSES_HIDDEN) notFound();
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              강의 목록
            </h1>
            <p className="mt-4 text-neutral-500 text-lg">
              실전에서 바로 써먹을 수 있는 강의를 만나보세요
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl ig-gradient flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-black italic">T</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">강의를 준비 중입니다</h3>
              <p className="text-neutral-500 mt-2">곧 새로운 강의가 등록될 예정입니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {products.map((product) => {
                const isRecommended = product.slug === RECOMMENDED_SLUG;
                return (
                <Link
                  key={product.id}
                  href={`/courses/${product.slug}`}
                  className={
                    isRecommended
                      ? "group relative bg-white rounded-2xl overflow-hidden ring-2 ring-pink-500 shadow-2xl transition-all duration-300 lg:-translate-y-3 hover:-translate-y-4"
                      : "group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  }
                >
                  {isRecommended && (
                    <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full ig-gradient text-white text-[11px] font-black tracking-wider shadow-lg">
                      추천
                    </span>
                  )}
                  <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full ig-gradient flex items-center justify-center">
                        <span className="text-white text-5xl font-black italic">T</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    {product.subtitle && (
                      <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{product.subtitle}</p>
                    )}
                    {product.highlights.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {product.highlights.slice(0, 3).map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                            <span className="text-pink-500 mt-0.5">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xl font-black text-neutral-900">
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className={
                          isRecommended
                            ? "text-sm font-bold px-5 py-2.5 rounded-xl ig-gradient text-white shadow-lg"
                            : "text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white"
                        }
                      >
                        수강 신청
                      </span>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
