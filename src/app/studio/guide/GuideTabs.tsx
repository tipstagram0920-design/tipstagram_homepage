"use client";
import { useState } from "react";

type Step = { title: string; body: string; img?: string };

const MAC: Step[] = [
  { title: "설치 페이지에서 “내 컴퓨터에 설치하기 (Mac)”을 눌러요", body: "파일 하나(팁스타그램-스튜디오-설치.command)가 다운로드 폴더에 받아져요.", img: "/studio/guide/mac-1.png" },
  { title: "받은 파일을 오른쪽 클릭 → 열기 → 열기", body: "처음 한 번 “확인되지 않은 개발자” 창이 떠요. 더블클릭 말고 오른쪽 클릭으로 열면 통과돼요.", img: "/studio/guide/mac-2.png" },
  { title: "검은 터미널 창이 뜨고 [1/7]…[7/7] 이 차례로 지나가요", body: "3~6분 걸려요. 창을 닫지 말고 기다리세요. 중간에 “준비되면 엔터”가 보이면 엔터를 누르세요.", img: "/studio/guide/mac-3.png" },
  { title: "브라우저에 클로드 로그인 창이 뜨면 로그인", body: "준비물 ①의 계정으로 로그인해요. 검은 창에 클로드 화면이 보이면 Ctrl+C 를 두 번 눌러 나오면 설치가 이어져요.", img: "/studio/guide/mac-4.png" },
  { title: "브라우저에 스튜디오가 열리면 끝", body: "바탕화면에 “팁스타그램 스튜디오” 아이콘이 생겼어요. 다음부터는 그걸 누르면 돼요. 첫 화면에서 브랜드 설정부터 하세요.", img: "/studio/guide/mac-5.png" },
];
const WIN: Step[] = [
  { title: "설치 페이지에서 “내 컴퓨터에 설치하기 (Windows)”를 눌러요", body: "파일 하나(팁스타그램-스튜디오-설치.bat)가 다운로드 폴더에 받아져요. 브라우저가 “안전하지 않을 수 있다”고 하면 ‘유지’를 누르세요.", img: "/studio/guide/win-1.png" },
  { title: "받은 파일을 더블클릭 → “추가 정보” → “실행”", body: "파란 “Windows의 PC 보호” 창이 떠요. 추가 정보를 누르면 실행 버튼이 나와요.", img: "/studio/guide/win-2.png" },
  { title: "검은 창이 뜨고 [1/7]…[7/7] 이 차례로 지나가요", body: "3~6분 걸려요. 창을 닫지 말고 기다리세요. 중간에 “준비되면 엔터”가 보이면 엔터를 누르세요.", img: "/studio/guide/win-3.png" },
  { title: "브라우저에 클로드 로그인 창이 뜨면 로그인", body: "준비물 ①의 계정으로 로그인해요. 검은 창에 클로드 화면이 보이면 Ctrl+C 를 두 번 눌러 나오면 설치가 이어져요.", img: "/studio/guide/win-4.png" },
  { title: "브라우저에 스튜디오가 열리면 끝", body: "바탕화면에 “팁스타그램 스튜디오” 아이콘이 생겼어요. 다음부터는 그걸 누르면 돼요. 첫 화면에서 브랜드 설정부터 하세요.", img: "/studio/guide/win-5.png" },
];

export function GuideTabs() {
  const [os, setOs] = useState<"mac" | "win">("mac");
  const steps = os === "mac" ? MAC : WIN;
  return (
    <div>
      <div className="inline-flex rounded-xl border border-neutral-200 p-1 mb-6">
        {(["mac", "win"] as const).map((k) => (
          <button key={k} onClick={() => setOs(k)} className={`px-5 py-2 rounded-lg text-sm font-bold ${os === k ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>{k === "mac" ? "Mac" : "Windows"}</button>
        ))}
      </div>
      <ol className="space-y-6">
        {steps.map((s, i) => (
          <li key={i} className="rounded-2xl border border-neutral-200 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full ig-gradient text-white font-black flex items-center justify-center">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-neutral-900 leading-snug">{s.title}</p>
                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">{s.body}</p>
                {s.img && (
                  <GuideImage src={s.img} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function GuideImage({ src }: { src: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 text-xs text-center py-8">캡처 준비 중 ({src.split("/").pop()})</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setMissing(true)} className="mt-4 rounded-xl border border-neutral-200 w-full" />;
}
