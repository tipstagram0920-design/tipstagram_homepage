"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, LogOut, User, BookOpen, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "홈", href: "/" },
  { label: "강의", href: "/courses" },
  { label: "게시판", href: "/board" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 라우트가 바뀌면 모바일 메뉴 닫기
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열려 있을 때 바디 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const initial = session?.user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md",
        scrolled
          ? "border-b border-neutral-100 shadow-sm"
          : "border-b border-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="홈" className="shrink-0">
          <Logo size="sm" variant="default" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-bold">
                  {initial}
                </div>
                <span>{session.user?.name || "사용자"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-neutral-100 shadow-lg overflow-hidden">
                  <Link href="/classroom" className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <BookOpen className="w-4 h-4" />내 강의실
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <User className="w-4 h-4" />내 프로필
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />관리자
                    </Link>
                  )}
                  <hr className="border-neutral-100" />
                  <button onClick={() => { signOut(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                로그인
              </Link>
              <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-lg ig-gradient text-white hover:opacity-90 transition-opacity">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden -mr-2 p-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bottom-0 z-40 transition-all duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        {/* 배경 dim — 탭하면 닫기 */}
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

        {/* 패널 */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 bg-white shadow-xl transition-transform duration-300 origin-top max-h-[calc(100vh-4rem)] overflow-y-auto",
            isOpen ? "translate-y-0" : "-translate-y-2"
          )}
        >
          {/* 사용자 정보 */}
          {session && (
            <div className="px-5 py-5 border-b border-neutral-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full ig-gradient flex items-center justify-center text-white font-bold text-base shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 truncate">{session.user?.name || "사용자"}</p>
                <p className="text-xs text-neutral-500 truncate">{session.user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">관리자</span>
                )}
              </div>
            </div>
          )}

          {/* 메인 메뉴 */}
          <nav className="px-3 py-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3.5 rounded-xl text-base font-semibold transition-colors",
                    active
                      ? "bg-pink-50 text-pink-600"
                      : "text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 사용자 메뉴 */}
          {session ? (
            <>
              <hr className="my-1 border-neutral-100" />
              <nav className="px-3 py-2">
                <Link href="/classroom" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100">
                  <BookOpen className="w-5 h-5 text-neutral-500" />내 강의실
                </Link>
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100">
                  <User className="w-5 h-5 text-neutral-500" />내 프로필
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100">
                    <LayoutDashboard className="w-5 h-5 text-neutral-500" />관리자
                  </Link>
                )}
              </nav>
              <div className="px-3 pb-5 pt-2">
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 active:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />로그아웃
                </button>
              </div>
            </>
          ) : (
            <div className="px-3 pb-5 pt-2 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3.5 rounded-xl text-base font-semibold text-neutral-800 border border-neutral-200 active:bg-neutral-50"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="block w-full text-center px-4 py-3.5 rounded-xl text-base font-bold text-white ig-gradient shadow-lg shadow-pink-900/30"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
