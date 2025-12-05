"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
  created_at: string;
}

export default function OrderCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId && user) {
      loadOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId, user]);

  async function loadOrder(id: string) {
    if (!user) return;

    setLoading(true);
    try {
      const clerkId = user.id;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("clerk_id", clerkId)
        .single();

      if (error) {
        console.error("Error loading order:", error);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!orderId) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">주문 정보를 찾을 수 없습니다.</p>
          <Link href="/mypage/orders">
            <Button>주문 내역으로</Button>
          </Link>
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

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">주문을 찾을 수 없습니다.</p>
          <Link href="/mypage/orders">
            <Button>주문 내역으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(order.total_amount);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">주문이 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8">
          주문번호: {order.id.slice(0, 8).toUpperCase()}
        </p>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">주문 금액</span>
              <span className="font-bold">{formattedTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">주문 상태</span>
              <span className="font-bold">
                {order.status === "pending" && "대기 중"}
                {order.status === "confirmed" && "확인됨"}
                {order.status === "shipped" && "배송 중"}
                {order.status === "delivered" && "배송 완료"}
                {order.status === "cancelled" && "취소됨"}
              </span>
            </div>
            {order.payment_status && (
              <div className="flex justify-between">
                <span className="text-gray-600">결제 상태</span>
                <span className="font-bold">
                  {order.payment_status === "pending" && "대기 중"}
                  {order.payment_status === "completed" && "결제 완료"}
                  {order.payment_status === "failed" && "결제 실패"}
                  {order.payment_status === "cancelled" && "결제 취소"}
                </span>
              </div>
            )}
            {order.payment_method && (
              <div className="flex justify-between">
                <span className="text-gray-600">결제 방법</span>
                <span className="font-bold">
                  {order.payment_method === "card" && "신용/체크카드"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline">쇼핑 계속하기</Button>
          </Link>
          <Link href={`/mypage/orders/${order.id}`}>
            <Button>주문 상세 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

