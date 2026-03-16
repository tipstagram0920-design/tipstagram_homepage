import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug, isActive: true } });
  if (!page) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-black text-neutral-900 mb-8">{page.title}</h1>
          <div
            className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
