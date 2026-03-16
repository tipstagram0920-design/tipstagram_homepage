import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

async function getCoursesData() {
  return await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: {
      course: {
        include: {
          sections: {
            include: { lessons: true },
          },
        },
      },
    },
  }).catch(() => []);
}

export default async function AdminCoursesPage() {
  const products = await getCoursesData();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">교육과정 관리</h1>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => {
          const course = product.course;
          const totalLessons = course?.sections.reduce((acc, s) => acc + s.lessons.length, 0) || 0;

          return (
            <div key={product.id} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    {product.thumbnail
                      ? <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full ig-gradient flex items-center justify-center text-white font-bold italic text-lg">T</div>
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{product.title}</h3>
                    {course ? (
                      <p className="text-sm text-neutral-500">
                        {course.sections.length}섹션 · {totalLessons}강
                      </p>
                    ) : (
                      <p className="text-sm text-orange-500">커리큘럼 미등록</p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/admin/courses/${product.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl ig-gradient text-white text-sm font-semibold hover:opacity-90"
                >
                  {course ? (
                    <><BookOpen className="w-4 h-4" /> 커리큘럼 편집</>
                  ) : (
                    <><Plus className="w-4 h-4" /> 커리큘럼 등록</>
                  )}
                </Link>
              </div>

              {/* Section preview */}
              {course && course.sections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex flex-wrap gap-2">
                    {course.sections.map((section) => (
                      <span key={section.id} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
                        {section.title} ({section.lessons.length}강)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
