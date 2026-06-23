"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ShoppingBag, BookOpen, Users,
  FileText, SlidersHorizontal, Tag,
  Mail, MailOpen, MessageSquare, PanelTop, Radio, Sparkles, Workflow, Calendar, CreditCard,
  TrendingUp, Gift,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "개요",
    items: [
      { label: "대시보드", href: "/admin", icon: LayoutDashboard },
      { label: "자동화 신청 현황", href: "/admin/crm/funnel", icon: TrendingUp },
    ],
  },
  {
    title: "고객",
    items: [
      { label: "컨택트", href: "/admin/crm/contacts", icon: Sparkles },
      // 회원 관리는 컨택트로 통합됨. /admin/users URL은 유지 (CSV·일괄 작업용).
      // 컨택트 리스트 상단의 "고급 일괄 작업" 링크로 접근.
    ],
  },
  {
    title: "자동화 · 메시징",
    items: [
      { label: "워크플로우", href: "/admin/crm/workflows", icon: Workflow },
      { label: "웨비나 캠페인", href: "/admin/crm/webinar", icon: Calendar },
      { label: "운영 to-do", href: "/admin/crm/tasks", icon: Calendar },
      { label: "예약 메시지", href: "/admin/crm/broadcast", icon: Calendar },
      { label: "메일 발송", href: "/admin/mail", icon: Mail },
      { label: "이메일 템플릿", href: "/admin/email-templates", icon: MailOpen },
      { label: "라이브 / 전자책 설정", href: "/admin/live-settings", icon: Radio },
      { label: "무료 자료 (리드 마그넷)", href: "/admin/crm/freebies", icon: Gift },
      { label: "전자책 신청 현황", href: "/admin/crm/ebook", icon: BookOpen },
      { label: "진단 세션 신청", href: "/admin/crm/consultation", icon: Sparkles },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      { label: "홈페이지 편집", href: "/admin/homepage", icon: PanelTop },
      { label: "상품 관리", href: "/admin/products", icon: ShoppingBag },
      { label: "교육과정 관리", href: "/admin/courses", icon: BookOpen },
      { label: "슬라이드 관리", href: "/admin/slides", icon: SlidersHorizontal },
      { label: "페이지 관리", href: "/admin/pages", icon: FileText },
      { label: "게시판 관리", href: "/admin/board", icon: MessageSquare },
    ],
  },
  {
    title: "판매",
    items: [
      { label: "쿠폰 관리", href: "/admin/coupons", icon: Tag },
      { label: "결제 설정", href: "/admin/checkout-settings", icon: CreditCard },
    ],
  },
];

function isItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/crm") return pathname === "/admin/crm";
  // /admin/users는 /admin/crm/contacts 등과 prefix 안 충돌
  return pathname === href || pathname.startsWith(href + "/");
}

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
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-neutral-500">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const isActive = isItemActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
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
            </div>
          </div>
        ))}
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
