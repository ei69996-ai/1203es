"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  detail: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
    detail: "",
    zipCode: "",
  });
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      router.push("/cart");
    }
  }, [user]);

  async function loadCartItems() {
    if (!user) return;

    setLoading(true);
    try {
      const clerkId = user.id;
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          product:products(*)
        `
        )
        .eq("clerk_id", clerkId);

      if (error) {
        console.error("Error loading cart items:", error);
        return;
      }

      setCartItems((data as CartItem[]) || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || cartItems.length === 0) return;

    // 배송지 정보 검증
    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.detail ||
      !shippingAddress.zipCode
    ) {
      alert("배송지 정보를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const clerkId = user.id;

      // 총 금액 계산
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      // 주문 생성
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          clerk_id: clerkId,
          total_amount: totalAmount,
          status: "pending",
          shipping_address: shippingAddress,
          order_note: orderNote || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        alert("주문 생성에 실패했습니다.");
        return;
      }

      // 주문 상세 아이템 생성
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        alert("주문 상세 생성에 실패했습니다.");
        return;
      }

      // 장바구니 비우기
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("clerk_id", clerkId);

      if (deleteError) {
        console.error("Error clearing cart:", deleteError);
        // 주문은 생성되었으므로 계속 진행
      }

      // 결제 페이지로 이동
      router.push(`/payment?orderId=${order.id}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const formattedTotal = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(totalAmount);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
          <Button onClick={() => router.push("/products")}>
            상품 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">주문하기</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 배송지 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">배송지 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">받는 분 이름 *</Label>
                <Input
                  id="name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">우편번호 *</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      zipCode: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="detail">상세주소 *</Label>
                <Input
                  id="detail"
                  value={shippingAddress.detail}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      detail: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">주문 요약</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => {
                const itemTotal = item.product.price * item.quantity;
                const formattedPrice = new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                }).format(item.product.price);
                const formattedItemTotal = new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                }).format(itemTotal);

                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formattedItemTotal}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* 주문 요청사항 */}
          <div className="bg-white border rounded-lg p-6">
            <Label htmlFor="orderNote">주문 요청사항 (선택사항)</Label>
            <Textarea
              id="orderNote"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              rows={3}
              className="mt-2"
              placeholder="배송 시 요청사항을 입력해주세요."
            />
          </div>

          {/* 주문하기 버튼 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              이전으로
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "주문 처리 중..." : "주문하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

