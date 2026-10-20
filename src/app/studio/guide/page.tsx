import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GuideTabs } from "./GuideTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "스튜디오 설치 방법 | 팁스타그램" };

/**
 * 처음 설치하는 수강생을 위한 단계별 안내. 그림 자리(캡처)는 비워 두었다 — public/studio/guide/ 에 넣고 src 만 채우면 된다.
 */
export default function StudioGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold tracking-[2px] text-pink-600 uppercase mb-3">설치 방법</p>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">처음 한 번만 따라 하면 돼요</h1>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            전부 합쳐 10분쯤 걸려요. 어려운 건 없고, 중간에 뜨는 창을 <b>닫지 않고</b> 기다리는 게 전부예요.
          </p>

          <section className="mt-10 rounded-3xl border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-black text-neutral-900">준비물 2가지</h2>
            <ol className="mt-4 space-y-4 text-neutral-700 leading-relaxed">
              <li>
                <p className="font-bold text-neutral-900">① 클로드(Claude) 유료 계정</p>
                <p className="text-sm mt-1">
                  글을 써주는 AI예요. <a href="https://claude.ai" target="_blank" rel="noreferrer" className="underline">claude.ai</a> 에서 가입하고 <b>Pro</b>(월 2~3만원대) 이상으로 올려 두세요. 무료 계정으로는 프로그램이 글을 쓰지 못해요.
                  설치 중에 로그인 창이 한 번 뜨고, 그때 이 계정으로 로그인하면 돼요.
                </p>
              </li>
              <li>
                <p className="font-bold text-neutral-900">② 컴퓨터</p>
                <p className="text-sm mt-1">Mac(2020년 이후, macOS 13 이상) 또는 Windows 10·11. 인터넷이 돼야 하고, 빈 공간이 2GB 정도 있으면 돼요. 휴대폰·아이패드로는 설치가 안 돼요.</p>
              </li>
            </ol>
            <p className="mt-4 text-sm text-neutral-500">릴스의 그림·목소리까지 쓰려면 나중에 구글 Gemini 키가 필요한데, 그건 프로그램 안 설정 화면이 알려줘요. 설치 때는 필요 없어요.</p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-black text-neutral-900 mb-4">설치 순서</h2>
            <GuideTabs />
          </section>

          <section className="mt-10 rounded-3xl bg-neutral-50 border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-black text-neutral-900">자주 막히는 곳</h2>
            <dl className="mt-4 space-y-4 text-sm text-neutral-700 leading-relaxed">
              <div><dt className="font-bold text-neutral-900">“확인되지 않은 개발자” / “PC 보호” 창이 떠요</dt><dd>정상이에요. Mac은 파일을 <b>오른쪽 클릭 → 열기</b>, Windows는 <b>추가 정보 → 실행</b>. 처음 한 번만 그래요.</dd></div>
              <div><dt className="font-bold text-neutral-900">검은 창이 한참 멈춘 것 같아요</dt><dd>내려받는 중이에요. 5분까지는 기다려 주세요. 창을 닫으면 처음부터 다시 해요.</dd></div>
              <div><dt className="font-bold text-neutral-900">클로드 로그인 창이 안 떠요</dt><dd>검은 창에 “준비되면 엔터”가 보이면 엔터를 한 번 누르세요. 브라우저가 열리면 로그인하고, 검은 창에 클로드 화면이 보이면 Ctrl+C 를 두 번 눌러 나오세요. 설치가 이어져요.</dd></div>
              <div><dt className="font-bold text-neutral-900">끝났는데 바탕화면에 아이콘이 없어요</dt><dd>문서 폴더 → tipstagram-studio 안의 <b>시작</b> 파일을 더블클릭하면 똑같이 켜져요. 또는 설치 파일을 한 번 더 실행하면 아이콘을 다시 만들어요.</dd></div>
              <div><dt className="font-bold text-neutral-900">나중에 업데이트는요?</dt><dd>설치 파일을 다시 더블클릭하면 돼요. 내가 만든 것과 설정은 그대로 남아요.</dd></div>
              <div><dt className="font-bold text-neutral-900">그래도 안 돼요</dt><dd>검은 창 내용을 캡처해서 문의해 주세요. 또는 프로그램 폴더에서 Claude Code 를 열고 “설치해줘”라고 말하면 클로드가 스스로 고쳐요.</dd></div>
            </dl>
          </section>

          <div className="mt-10 text-center">
            <Link href="/studio" className="inline-block px-6 py-3 rounded-xl ig-gradient text-white font-bold text-sm">설치 파일 받으러 가기</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
