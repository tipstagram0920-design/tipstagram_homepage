import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/courses/${product.slug}`}
                  className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
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
                      <span className="text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white">
                        수강 신청
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
