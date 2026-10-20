import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { hasStudioAccess, detectOs, MONETIZATION_SLUG } from "@/lib/studio";
import { StudioDownload } from "./StudioDownload";

export const dynamic = "force-dynamic";

function studioVersion(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", "studio", "VERSION"), "utf8").trim();
  } catch {
    return "";
  }
}

export default async function StudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio");

  const allowed = await hasStudioAccess(session.user.id).catch(() => false);
  const ua = (await headers()).get("user-agent") || "";
  const os = detectOs(ua);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold tracking-[2px] text-pink-600 uppercase mb-3">팁스타그램 수익화 스튜디오</p>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            내 컴퓨터에서 카드뉴스와 릴스를 만드는 프로그램
          </h1>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            브랜드만 한 번 적어두면 소재 찾기 → 카드뉴스 → 릴스(그림·자막·목소리)까지 버튼 몇 번으로 끝나요. 결과물은 내 컴퓨터에 그대로 남아요.
          </p>

          <div className="mt-10">
            {allowed ? (
              <StudioDownload initialOs={os} version={studioVersion()} />
            ) : (
              <div className="rounded-3xl border border-neutral-200 p-8 text-center">
                <p className="text-lg font-black text-neutral-900">수익화 프로그램 수강생에게 열려 있어요</p>
                <p className="mt-2 text-sm text-neutral-600">
                  팁스타그램 수익화 프로그램을 신청하면 바로 이 화면에서 설치 파일을 받을 수 있어요. 5주 챌린지 수강생도 받을 수 있어요.
                </p>
                <Link href={`/courses/${MONETIZATION_SLUG}`} className="mt-6 inline-block px-6 py-3 rounded-xl ig-gradient text-white font-bold text-sm">
                  수익화 프로그램 보기
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
