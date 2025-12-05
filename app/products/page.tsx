"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ProductCard, { Product } from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/ui/button";

type SortOption = "latest" | "price_asc" | "price_desc";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  // URL 쿼리 파라미터에서 카테고리와 페이지 가져오기
  const categoryFromUrl = searchParams.get("category") || "all";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  // 공개 데이터는 인증 없이 접근 가능한 클라이언트 사용
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  // URL 파라미터가 변경되면 카테고리 및 페이지 업데이트
  useEffect(() => {
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
    }
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [categoryFromUrl, pageFromUrl]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortOption, currentPage]);

  async function loadProducts() {
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase 환경변수가 설정되지 않았습니다.");
        setLoading(false);
        return;
      }

      // 총 개수 조회
      let countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (selectedCategory !== "all") {
        countQuery = countQuery.eq("category", selectedCategory);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error counting products:", countError);
        setLoading(false);
        return;
      }

      setTotalCount(count || 0);

      // 페이지네이션을 위한 offset 계산
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .range(from, to);

      // 카테고리 필터링
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // 정렬
      switch (sortOption) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "latest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading products:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // 테이블이 없는 경우를 특별히 처리
        if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
          console.error("⚠️ products 테이블이 존재하지 않습니다. 마이그레이션을 실행해주세요.");
          console.error("Supabase Dashboard > SQL Editor에서 update_shopping_mall_schema.sql 파일을 실행하세요.");
        }
        
        return;
      }

      // null 값 처리
      const processedData = (data || []).map((item) => ({
        ...item,
        description: item.description ?? null,
        category: item.category ?? null,
      })) as Product[];

      setProducts(processedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">상품 목록</h1>

        {/* 필터 및 정렬 */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* 정렬 옵션 */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">정렬:</span>
            <Button
              variant={sortOption === "latest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOption("latest")}
            >
              최신순
            </Button>
            <Button
              variant={sortOption === "price_asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOption("price_asc")}
            >
              가격 낮은순
            </Button>
            <Button
              variant={sortOption === "price_desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOption("price_desc")}
            >
              가격 높은순
            </Button>
          </div>
        </div>

        {/* 상품 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">상품이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 페이지네이션 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

