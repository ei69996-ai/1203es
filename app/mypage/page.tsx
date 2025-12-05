"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, User } from "lucide-react";

export default function MyPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{user.fullName || "사용자"}</p>
                  <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/mypage/orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    주문 내역
                  </Button>
                </Link>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">프로필 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">이름</label>
                  <p className="font-medium">{user.fullName || "미설정"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">이메일</label>
                  <p className="font-medium">
                    {user.primaryEmailAddress?.emailAddress || "미설정"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

