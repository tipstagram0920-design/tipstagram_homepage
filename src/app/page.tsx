import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { InterviewSection } from "@/components/home/InterviewSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    return await prisma.product.findMany({ where: { isActive: true }, orderBy: { order: "asc" }, take: 6 });
  } catch { return []; }
}

async function getSlides() {
  try {
    return await prisma.slide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
  } catch { return []; }
}

async function getHomepageBlocks() {
  try {
    const raw = await prisma.homepageBlock.findMany({
      where: { isActive: true },
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
    const bySection = (section: string) =>
      raw
        .filter(b => b.section === section)
        .flatMap(b => {
          try { return [JSON.parse(b.data)]; }
          catch { return []; }
        });
    return {
      stats: bySection("stats"),
      painPoints: bySection("pain_points"),
      solutions: bySection("solutions"),
      benefits: bySection("benefits"),
      faqs: bySection("faq"),
      videos: bySection("videos"),
      reviews: bySection("reviews"),
    };
  } catch (e) {
    console.error("[getHomepageBlocks] Prisma error:", e);
    return { stats: [], painPoints: [], solutions: [], benefits: [], faqs: [], videos: [], reviews: [] };
  }
}

export default async function HomePage() {
  const [products, slides, hb] = await Promise.all([getProducts(), getSlides(), getHomepageBlocks()]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSlider slides={slides.length > 0 ? slides : undefined} />
        <AboutSection
          stats={hb.stats.length > 0 ? hb.stats : undefined}
          painPoints={hb.painPoints.length > 0 ? hb.painPoints : undefined}
          solutions={hb.solutions.length > 0 ? hb.solutions : undefined}
        />
        <FeaturedCourses products={products} />
        <InterviewSection
          videos={hb.videos.length > 0 ? hb.videos : undefined}
          reviews={hb.reviews.length > 0 ? hb.reviews : undefined}
        />
        <BenefitsSection benefits={hb.benefits.length > 0 ? hb.benefits : undefined} />
        <FaqSection faqs={hb.faqs.length > 0 ? hb.faqs : undefined} />
      </main>
      <Footer />
    </div>
  );
}
