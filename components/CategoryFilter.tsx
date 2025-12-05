"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "electronics", label: "전자제품" },
  { value: "clothing", label: "의류" },
  { value: "books", label: "도서" },
  { value: "food", label: "식품" },
  { value: "sports", label: "스포츠" },
  { value: "beauty", label: "뷰티" },
  { value: "home", label: "생활/가정" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            "transition-colors",
            selectedCategory === category.value &&
              "bg-primary text-primary-foreground"
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

