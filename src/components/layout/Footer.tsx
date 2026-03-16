import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Instagram, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-neutral-800">
          <div className="md:col-span-2">
            <Logo size="sm" variant="white" />
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-xs">
              팁스타그램은 실전 중심의 강의 플랫폼입니다.
              현업 전문가들의 노하우를 배우고, 성장하세요.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">서비스</h4>
            <ul className="space-y-2.5">
              {[
                { label: "강의 목록", href: "/courses" },
                { label: "게시판", href: "/board" },
                { label: "내 강의실", href: "/classroom" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2.5">
              {[
                { label: "공지사항", href: "/board?category=notice" },
                { label: "자주 묻는 질문", href: "/faq" },
                { label: "이용약관", href: "/terms" },
                { label: "개인정보처리방침", href: "/privacy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© 2024 팁스타그램. All rights reserved.</p>
          <p>사업자등록번호: 000-00-00000 | 대표: 홍길동</p>
        </div>
      </div>
    </footer>
  );
}
