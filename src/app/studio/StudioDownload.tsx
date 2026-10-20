"use client";
import { useState } from "react";
import { Download, Monitor, Apple, HelpCircle } from "lucide-react";

type Os = "mac" | "windows" | "other";
type PickOs = "mac" | "windows";
const FILES: Record<PickOs, string> = {
  mac: "/studio/팁스타그램-스튜디오-설치.command",
  windows: "/studio/팁스타그램-스튜디오-설치.bat",
};

export function StudioDownload({ initialOs, version }: { initialOs: Os; version: string }) {
  const [os, setOs] = useState<PickOs>(initialOs === "windows" ? "windows" : "mac");
  const other: PickOs = os === "mac" ? "windows" : "mac";
  return (
    <div>
      <a
        href={FILES[os]}
        download
        className="flex items-center justify-center gap-3 w-full rounded-2xl ig-gradient text-white font-black text-lg sm:text-xl py-5 hover:opacity-95 transition"
      >
        <Download className="w-6 h-6" />
        내 컴퓨터에 설치하기 ({os === "mac" ? "Mac" : "Windows"})
      </a>
      <p className="mt-4 text-center text-sm">
        <a href="/studio/guide" className="font-bold text-pink-600 underline underline-offset-4">처음이세요? 그림으로 보는 설치 방법 →</a>
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
        <span>버전 {version} · 파일 하나를 받아 더블클릭하면 끝이에요</span>
        <button onClick={() => setOs(other)} className="underline underline-offset-2 hover:text-neutral-900">
          {other === "mac" ? <span className="inline-flex items-center gap-1"><Apple className="w-4 h-4" />Mac 이에요</span> : <span className="inline-flex items-center gap-1"><Monitor className="w-4 h-4" />Windows 예요</span>}
        </button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="font-black text-neutral-900 mb-2">1. 받은 파일을 더블클릭</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {os === "mac"
              ? "처음 한 번 “확인되지 않은 개발자” 창이 뜨면, 파일을 오른쪽 클릭 → 열기 → 열기 를 누르세요. 검은 터미널 창이 뜨고 설치가 시작돼요."
              : "“Windows의 PC 보호” 창이 뜨면 추가 정보 → 실행 을 누르세요. 검은 창이 뜨고 설치가 시작돼요."}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="font-black text-neutral-900 mb-2">2. 3~6분 기다리기</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            필요한 프로그램을 알아서 내려받고 바탕화면에 <b>“팁스타그램 스튜디오”</b> 아이콘을 만들어요. 중간에 클로드(Claude) 로그인 창이 뜨면 로그인만 해 주세요.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="font-black text-neutral-900 mb-2">3. 브라우저에 스튜디오가 열리면 끝</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            다음부터는 바탕화면 아이콘을 누르면 돼요. 브랜드 설정부터 하고, 매거진 콘텐츠 만들기로 첫 카드뉴스를 만들어 보세요.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="font-black text-neutral-900 mb-2">4. 릴스까지 쓰려면</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            스튜디오 설정에서 구글 Gemini 키를 연결하세요(안내가 화면에 있어요). 글 분석은 무료, 그림·목소리는 구글 결제가 필요해요(릴스 하나 500원 정도).
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-neutral-50 border border-neutral-200 p-5 text-sm text-neutral-600 leading-relaxed">
        <p className="font-black text-neutral-900 mb-1 inline-flex items-center gap-1"><HelpCircle className="w-4 h-4" /> 안 될 때</p>
        <p>필요한 것: Mac(macOS 13 이상) 또는 Windows 10 이상, 인터넷, 클로드(Claude) 유료 계정(Pro 이상). 설치 파일을 다시 더블클릭하면 이어서 설치하거나 최신으로 업데이트돼요. 그래도 안 되면 설치 창 내용을 캡처해서 문의해 주세요. 압축 파일을 직접 받으려면 <a href="/studio/tipstagram-studio.zip" className="underline">여기</a>.</p>
      </div>
    </div>
  );
}
