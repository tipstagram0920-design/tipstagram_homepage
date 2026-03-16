"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark";
  href?: string;
}

const sizeMap = {
  sm: { fontSize: 22, letterSpacing: "-0.5px" },
  md: { fontSize: 30, letterSpacing: "-1px" },
  lg: { fontSize: 42, letterSpacing: "-1.5px" },
  xl: { fontSize: 58, letterSpacing: "-2px" },
};

export function Logo({ className, size = "md", variant = "default", href = "/" }: LogoProps) {
  const { fontSize, letterSpacing } = sizeMap[size];

  const gradientId = `logo-grad-${size}`;

  const logoContent = (
    <span
      className={cn("inline-flex items-center select-none", className)}
      style={{ fontFamily: "var(--font-permanent-marker), 'Permanent Marker', cursive", lineHeight: 1 }}
    >
      <svg
        width={fontSize * 7.2}
        height={fontSize * 1.5}
        viewBox={`0 0 ${fontSize * 7.2} ${fontSize * 1.5}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#833AB4" />
            <stop offset="45%" stopColor="#FD1D1D" />
            <stop offset="100%" stopColor="#FCAF45" />
          </linearGradient>
        </defs>

        {/* Rough underline / crossbar — Stussy vibe */}
        {variant === "default" && (
          <>
            <line
              x1={fontSize * 0.1}
              y1={fontSize * 1.35}
              x2={fontSize * 6.9}
              y2={fontSize * 1.28}
              stroke={`url(#${gradientId})`}
              strokeWidth={fontSize * 0.09}
              strokeLinecap="round"
            />
            <line
              x1={fontSize * 0.3}
              y1={fontSize * 1.45}
              x2={fontSize * 5.2}
              y2={fontSize * 1.41}
              stroke={`url(#${gradientId})`}
              strokeWidth={fontSize * 0.045}
              strokeLinecap="round"
              opacity="0.5"
            />
          </>
        )}

        <text
          x="0"
          y={fontSize * 1.1}
          fontSize={fontSize}
          fontFamily="var(--font-permanent-marker), 'Permanent Marker', cursive"
          letterSpacing={letterSpacing}
          fill={
            variant === "default"
              ? `url(#${gradientId})`
              : variant === "white"
              ? "#ffffff"
              : "#0f0f0f"
          }
          style={{ fontWeight: 400 }}
        >
          Tipstagram
        </text>
      </svg>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
