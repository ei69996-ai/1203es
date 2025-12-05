"use client";

import { SignedOut, SignInButton, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [cartCount, setCartCount] = useState(0);

  // 장바구니 아이템 개수 조회
  useEffect(() => {
    async function fetchCartCount() {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const clerkId = user.id;
        const { data, error } = await supabase
          .from("cart_items")
          .select("id", { count: "exact", head: true })
          .eq("clerk_id", clerkId);

        if (error) {
          console.error("Error fetching cart count:", error);
          return;
        }

        setCartCount(data?.length || 0);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }

    fetchCartCount();
  }, [user, supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">
          쇼핑몰
        </Link>
        <nav className="flex gap-6 items-center">
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            상품
          </Link>
          <SignedIn>
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
