"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    detail: string;
    zipCode: string;
  } | null;
  order_note: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && user) {
      loadOrder(params.id as string);
    }
  }, [params.id, user]);

  async function loadOrder(orderId: string) {
    if (!user) return;

    setLoading(true);
    try {
      const clerkId = user.id;

      // 주문 정보 조회
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("clerk_id", clerkId)
        .single();

      if (orderError) {
        console.error("Error loading order:", orderError);
        return;
      }

      // 주문 상세 아이템 조회
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Error loading order items:", itemsError);
        return;
      }

      setOrder({
        ...orderData,
        order_items: itemsData || [],
      } as Order);
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

  const formattedDate = new Date(order.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/mypage/orders">
            <Button variant="ghost" className="mb-4">
              ← 주문 내역으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">주문 상세</h1>
        </div>

        <div className="space-y-6">
          {/* 주문 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">주문 정보</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문일시</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문 상태</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">주문 상품</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const formattedPrice = new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                }).format(item.price);
                const formattedItemTotal = new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                }).format(itemTotal);

                return (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {formattedPrice} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">{formattedItemTotal}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          {order.shipping_address && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">배송지 정보</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">받는 분</span>
                  <p className="font-medium">{order.shipping_address.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">연락처</span>
                  <p className="font-medium">{order.shipping_address.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">주소</span>
                  <p className="font-medium">
                    [{order.shipping_address.zipCode}] {order.shipping_address.address}{" "}
                    {order.shipping_address.detail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 주문 요청사항 */}
          {order.order_note && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">주문 요청사항</h2>
              <p className="text-gray-600">{order.order_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

