"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  // 공개 데이터는 인증 없이 접근
  const publicSupabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);
  // 장바구니 추가는 인증 필요
  const supabase = useClerkSupabaseClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 임시 이미지 배열 (실제로는 상품 이미지 URL 배열이어야 함)
  const productImages = useMemo(() => {
    // 실제 구현 시 Supabase Storage에서 이미지 URL을 가져와야 함
    // 현재는 플레이스홀더 이미지 배열 생성
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      url: null, // 실제 이미지 URL이 들어갈 자리
      alt: `${product?.name || "상품"} 이미지 ${i + 1}`,
    }));
  }, [product]);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  async function loadProduct(productId: string) {
    setLoading(true);
    try {
      const { data, error } = await publicSupabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error loading product:", error);
        return;
      }

      setProduct(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart() {
    if (!user || !product) return;

    setAddingToCart(true);
    try {
      // Clerk user ID 가져오기
      const clerkId = user.id;

      // 기존 장바구니 아이템 확인
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("clerk_id", clerkId)
        .eq("product_id", product.id)
        .single();

      if (existingItem) {
        // 기존 아이템이 있으면 수량 업데이트
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) {
          console.error("Error updating cart:", error);
          alert("장바구니 업데이트에 실패했습니다.");
          return;
        }
      } else {
        // 새 아이템 추가
        const { error } = await supabase.from("cart_items").insert({
          clerk_id: clerkId,
          product_id: product.id,
          quantity: quantity,
        });

        if (error) {
          console.error("Error adding to cart:", error);
          alert("장바구니 추가에 실패했습니다.");
          return;
        }
      }

      alert("장바구니에 추가되었습니다!");
      router.push("/cart");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("오류가 발생했습니다.");
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">상품을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/products")}>
            상품 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(product.price);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 상품 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
              <svg
                className="w-48 h-48 text-gray-400"
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
              
              {/* 이미지 네비게이션 버튼 (여러 이미지가 있을 때만 표시) */}
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex === 0
                          ? productImages.length - 1
                          : selectedImageIndex - 1
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex === productImages.length - 1
                          ? 0
                          : selectedImageIndex + 1
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* 썸네일 이미지 목록 (여러 이미지가 있을 때만 표시) */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-6">
            {product.category && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
                {product.category}
              </span>
            )}

            <h1 className="text-4xl font-bold">{product.name}</h1>

            <div className="text-3xl font-bold text-primary">
              {formattedPrice}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="font-medium">
                  수량:
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(
                            product.stock_quantity,
                            parseInt(e.target.value) || 1
                          )
                        )
                      )
                    }
                    className="w-20 text-center border rounded-md py-2"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock_quantity, quantity + 1)
                      )
                    }
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  재고: {product.stock_quantity}개
                </span>
              </div>

              {product.stock_quantity === 0 ? (
                <Button disabled className="w-full" size="lg">
                  품절
                </Button>
              ) : (
                <Button
                  onClick={addToCart}
                  disabled={!user || addingToCart}
                  className="w-full"
                  size="lg"
                >
                  {addingToCart ? (
                    "추가 중..."
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      장바구니에 추가
                    </>
                  )}
                </Button>
              )}

              {!user && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  장바구니에 추가하려면 로그인이 필요합니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

