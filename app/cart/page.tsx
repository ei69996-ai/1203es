"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    stock_quantity: number;
  };
}

export default function CartPage() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setLoading(false);
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
        .eq("clerk_id", clerkId)
        .order("created_at", { ascending: false });

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

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating quantity:", error);
        alert("수량 변경에 실패했습니다.");
        return;
      }

      loadCartItems();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("오류가 발생했습니다.");
    }
  }

  async function removeItem(itemId: string) {
    if (!confirm("장바구니에서 제거하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error removing item:", error);
        alert("제거에 실패했습니다.");
        return;
      }

      loadCartItems();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("오류가 발생했습니다.");
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
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link href="/products">
            <Button>상품 둘러보기</Button>
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

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
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
                  <div
                    key={item.id}
                    className="bg-white border rounded-lg p-6 flex gap-6"
                  >
                    {/* 상품 이미지 영역 */}
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold text-lg mb-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4">
                        {formattedPrice} × {item.quantity} = {formattedItemTotal}
                      </p>

                      {/* 수량 조절 및 삭제 */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock_quantity
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">주문 요약</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span>{formattedTotal}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 결제금액</span>
                      <span className="text-primary">{formattedTotal}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  주문하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

