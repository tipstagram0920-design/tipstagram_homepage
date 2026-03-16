import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  price: number;
  thumbnail?: string | null;
  highlights: string[];
}

interface FeaturedCoursesProps {
  products: Product[];
}

export function FeaturedCourses({ products }: FeaturedCoursesProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-4">
              추천 강의
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              지금 가장 인기 있는 강의
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            전체보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/courses/${product.slug}`}
              className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
                    <span className="text-white text-4xl font-black italic">T</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {product.title}
                </h3>
                {product.subtitle && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.subtitle}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-neutral-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600">
                    자세히 보기
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
            전체 강의 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
