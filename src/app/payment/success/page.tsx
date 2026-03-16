"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const productId = searchParams.get("productId");
    const couponId = searchParams.get("couponId");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount),
        productId,
        couponId,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/classroom"), 3000);
        } else {
          setStatus("error");
          setErrorMsg(data.error || "결제 확인에 실패했습니다.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("서버 오류가 발생했습니다.");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900">결제를 처리 중입니다...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-neutral-900">결제 완료!</h2>
            <p className="text-neutral-500 mt-2">강의 수강권이 등록되었습니다.</p>
            <p className="text-sm text-neutral-400 mt-4">잠시 후 강의실로 이동합니다...</p>
            <Link href="/classroom" className="mt-6 inline-block px-6 py-3 rounded-xl ig-gradient text-white font-bold text-sm">
              지금 바로 강의실로
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900">결제 실패</h2>
            <p className="text-neutral-500 mt-2">{errorMsg}</p>
            <Link href="/courses" className="mt-6 inline-block px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm">
              강의 목록으로
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
