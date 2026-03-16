"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="sm" variant={scrolled ? "default" : "default"} />

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

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-bold">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span>{session.user?.name || "사용자"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-neutral-100 shadow-lg overflow-hidden">
                  <Link
                    href="/classroom"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <BookOpen className="w-4 h-4" />내 강의실
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />내 프로필
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />관리자
                    </Link>
                  )}
                  <hr className="border-neutral-100" />
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg ig-gradient text-white hover:opacity-90 transition-opacity"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-neutral-700"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-neutral-100" />
          {session ? (
            <>
              <Link href="/classroom" className="block py-2 text-sm font-medium text-neutral-700" onClick={() => setIsOpen(false)}>
                내 강의실
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block py-2 text-sm font-medium text-neutral-700" onClick={() => setIsOpen(false)}>
                  관리자
                </Link>
              )}
              <button onClick={() => signOut()} className="block w-full text-left py-2 text-sm font-medium text-red-500">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm font-medium text-neutral-700" onClick={() => setIsOpen(false)}>
                로그인
              </Link>
              <Link href="/register" className="block py-2 text-sm font-semibold text-center rounded-lg ig-gradient text-white" onClick={() => setIsOpen(false)}>
                회원가입
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
