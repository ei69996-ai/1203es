import ProductCard, { Product } from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategoryProductsSectionProps {
  category: string;
  label: string;
  products: Product[];
}

export default function CategoryProductsSection({
  category,
  label,
  products,
}: CategoryProductsSectionProps) {
  // 상품이 없으면 섹션을 표시하지 않음
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{label}</h2>
          <Link href={`/products?category=${category}`}>
            <Button variant="outline">더 보기</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

