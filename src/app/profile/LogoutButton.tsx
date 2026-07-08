"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:border-red-300 hover:text-red-500"
    >
      <LogOut className="h-4 w-4" /> 로그아웃
    </button>
  );
}
