"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (orderId && user) {
      loadOrder();
    } else {
      router.push("/checkout");
    }
  }, [orderId, user]);

  async function loadOrder() {
    if (!user || !orderId) return;

    setLoading(true);
    try {
      const clerkId = user.id;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("clerk_id", clerkId)
        .single();

      if (error) {
        console.error("Error loading order:", error);
        router.push("/checkout");
        return;
      }

      // 이미 결제 완료된 주문인 경우
      if (data.payment_status === "completed") {
        router.push(`/order/complete?orderId=${orderId}`);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error("Unexpected error:", err);
      router.push("/checkout");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!order || !user) return;

    setProcessing(true);
    try {
      // 테스트 결제 시뮬레이션 (실제 Toss Payments MCP 대신)
      // 실제 환경에서는 Toss Payments MCP를 사용하여 결제를 진행합니다
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 결제 처리 시뮬레이션

      // 결제 성공 시뮬레이션 (90% 성공률)
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        // 결제 성공 - 주문 상태 업데이트
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_id: paymentId,
            payment_method: "card",
            payment_status: "completed",
            status: "confirmed", // 주문 상태를 confirmed로 변경
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
          alert("결제는 완료되었지만 주문 상태 업데이트에 실패했습니다.");
          return;
        }

        // 결제 완료 페이지로 이동
        router.push(`/order/complete?orderId=${order.id}`);
      } else {
        // 결제 실패
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "failed",
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
        }

        alert("결제에 실패했습니다. 다시 시도해주세요.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("결제 처리 중 오류가 발생했습니다.");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">주문 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/checkout")}>
            주문 페이지로
          </Button>
        </div>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(order.total_amount);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">결제하기</h1>

        {/* 주문 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">주문 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">주문번호</span>
              <span className="font-mono text-sm">
                {order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-2xl font-bold text-primary">
                {formattedTotal}
              </span>
            </div>
          </div>
        </div>

        {/* 결제 방법 선택 (테스트 모드) */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">결제 방법</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium">신용/체크카드</p>
                <p className="text-sm text-gray-500">테스트 결제 모드</p>
              </div>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>테스트 결제 모드:</strong> 실제 결제가 발생하지 않으며,
            테스트 목적으로만 사용됩니다.
          </p>
        </div>

        {/* 결제 버튼 */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                결제 처리 중...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                {formattedTotal} 결제하기
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            이전으로
          </Button>
        </div>
      </div>
    </div>
  );
}

