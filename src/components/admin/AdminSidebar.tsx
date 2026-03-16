"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, BookOpen, Users,
  Megaphone, FileText, SlidersHorizontal, Tag,
  Mail, MailOpen, BarChart3, MessageSquare, PanelTop,
} from "lucide-react";

const navItems = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "홈페이지 편집", href: "/admin/homepage", icon: PanelTop },
  { label: "상품 관리", href: "/admin/products", icon: ShoppingBag },
  { label: "교육과정 관리", href: "/admin/courses", icon: BookOpen },
  { label: "슬라이드 관리", href: "/admin/slides", icon: SlidersHorizontal },
  { label: "페이지 관리", href: "/admin/pages", icon: FileText },
  { label: "게시판 관리", href: "/admin/board", icon: MessageSquare },
  { label: "쿠폰 관리", href: "/admin/coupons", icon: Tag },
  { label: "회원 관리", href: "/admin/users", icon: Users },
  { label: "메일 발송", href: "/admin/mail", icon: Mail },
  { label: "이메일 템플릿", href: "/admin/email-templates", icon: MailOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-950 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-800">
        <Logo size="sm" variant="white" href="/admin" />
        <span className="text-xs text-neutral-500 mt-1 block">관리자 대시보드</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-800">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← 사이트로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
