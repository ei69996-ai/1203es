import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import ProductCard, { Product } from "@/components/ProductCard";
import CategoryProductsSection from "@/components/CategoryProductsSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // 공개 데이터는 인증 없이 접근 가능한 클라이언트 사용
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase 환경변수가 설정되지 않았습니다.");
      return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Error fetching products:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // 테이블이 없는 경우를 특별히 처리
      if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
        console.error("⚠️ products 테이블이 존재하지 않습니다. 마이그레이션을 실행해주세요.");
        console.error("Supabase Dashboard > SQL Editor에서 update_shopping_mall_schema.sql 파일을 실행하세요.");
      }
      
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      description: item.description ?? null,
      category: item.category ?? null,
    })) as Product[];
  } catch (err) {
    console.error("Unexpected error in getFeaturedProducts:", err);
    return [];
  }
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase 환경변수가 설정되지 않았습니다.");
      return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      description: item.description ?? null,
      category: item.category ?? null,
    })) as Product[];
  } catch (err) {
    console.error(`Unexpected error in getProductsByCategory for ${category}:`, err);
    return [];
  }
}

// 카테고리별 상품 조회 (병렬 처리)
async function getAllCategoryProducts() {
  const categories = [
    { value: "electronics", label: "전자제품" },
    { value: "clothing", label: "의류" },
    { value: "books", label: "도서" },
    { value: "food", label: "식품" },
    { value: "sports", label: "스포츠" },
    { value: "beauty", label: "뷰티" },
    { value: "home", label: "생활/가정" },
  ];

  // 모든 카테고리 상품을 병렬로 조회
  const categoryProductsPromises = categories.map((cat) =>
    getProductsByCategory(cat.value).then((products) => ({
      category: cat.value,
      label: cat.label,
      products,
    }))
  );

  const categoryProducts = await Promise.all(categoryProductsPromises);

  return categoryProducts;
}

export default async function Home() {
  const [products, categoryProducts] = await Promise.all([
    getFeaturedProducts(),
    getAllCategoryProducts(),
  ]);

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              최고의 쇼핑 경험을 만나보세요
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              다양한 카테고리의 상품을 한눈에
            </p>
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-6">
                상품 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 배너/프로모션 영역 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 프로모션 배너 1 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">신규 회원 혜택</h3>
              <p className="text-blue-100 mb-4">첫 구매 시 10% 할인</p>
              <Link href="/products">
                <Button variant="secondary" size="sm">
                  자세히 보기
                </Button>
              </Link>
            </div>

            {/* 프로모션 배너 2 */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">무료 배송</h3>
              <p className="text-purple-100 mb-4">5만원 이상 구매 시</p>
              <Link href="/products">
                <Button variant="secondary" size="sm">
                  자세히 보기
                </Button>
              </Link>
            </div>

            {/* 프로모션 배너 3 */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">특가 상품</h3>
              <p className="text-green-100 mb-4">한정 수량 특별 할인</p>
              <Link href="/products">
                <Button variant="secondary" size="sm">
                  자세히 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 인기 상품 섹션 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">인기 상품</h2>
            <Link href="/products">
              <Button variant="outline">전체 보기</Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 카테고리별 상품 미리보기 섹션 */}
      {categoryProducts.map(({ category, label, products: categoryProductsList }) => (
        <CategoryProductsSection
          key={category}
          category={category}
          label={label}
          products={categoryProductsList}
        />
      ))}
    </main>
  );
}
