"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  async function loadOrders() {
    if (!user) return;

    setLoading(true);
    try {
      const clerkId = user.id;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("clerk_id", clerkId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "대기 중";
      case "confirmed":
        return "확인됨";
      case "shipped":
        return "배송 중";
      case "delivered":
        return "배송 완료";
      case "cancelled":
        return "취소됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/mypage">
            <Button variant="ghost" className="mb-4">
              ← 마이페이지로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">주문 내역</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedTotal = new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(order.total_amount);

              const formattedDate = new Date(order.created_at).toLocaleDateString(
                "ko-KR",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={order.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        주문번호: {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-primary">
                      {formattedTotal}
                    </div>
                    <Link href={`/mypage/orders/${order.id}`}>
                      <Button variant="outline">상세 보기</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

