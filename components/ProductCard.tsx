"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* 상품 이미지 영역 (임시 플레이스홀더) */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-24 h-24"
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
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          <div className="mb-2">
            {product.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.category}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {formattedPrice}
            </span>
            {product.stock_quantity === 0 && (
              <span className="text-xs text-red-500">품절</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

