import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function LegalLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <header className="mb-10 pb-6 border-b border-neutral-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h1>
          <p className="mt-2 text-sm text-neutral-500">시행일: {effectiveDate}</p>
        </header>
        <article className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-800 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1">
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
