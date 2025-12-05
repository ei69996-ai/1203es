import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { customKoKR } from "@/lib/clerk/localization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "쇼핑몰",
    template: "%s | 쇼핑몰",
  },
  description: "다양한 카테고리의 상품을 한눈에 만나보세요. 최고의 쇼핑 경험을 제공합니다.",
  keywords: ["쇼핑몰", "온라인 쇼핑", "전자제품", "의류", "도서", "식품", "스포츠", "뷰티", "생활용품"],
  authors: [{ name: "쇼핑몰" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    title: "쇼핑몰",
    description: "다양한 카테고리의 상품을 한눈에 만나보세요.",
    siteName: "쇼핑몰",
  },
  twitter: {
    card: "summary_large_image",
    title: "쇼핑몰",
    description: "다양한 카테고리의 상품을 한눈에 만나보세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={customKoKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
