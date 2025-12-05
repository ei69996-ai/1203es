import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "*.supabase.co" }, // Supabase Storage 이미지
    ],
    formats: ["image/avif", "image/webp"],
  },
  // 코드 스플리팅 최적화
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
