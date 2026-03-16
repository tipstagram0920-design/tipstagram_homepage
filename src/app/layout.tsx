import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "팁스타그램 - 실전 강의 플랫폼",
  description: "팁스타그램은 현업 전문가들의 실전 노하우를 배우는 강의 플랫폼입니다.",
  openGraph: {
    title: "팁스타그램",
    description: "현업 전문가들의 실전 노하우를 배우세요",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={permanentMarker.variable}>
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
