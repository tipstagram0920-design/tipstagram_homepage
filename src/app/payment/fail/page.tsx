import Link from "next/link";

export default function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; code?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white rounded-3xl border border-neutral-100 p-12 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">결제 실패</h1>
          <p className="text-sm text-neutral-500">결제가 취소되거나 오류가 발생했습니다.</p>
        </div>
        <div className="bg-red-50 rounded-2xl px-5 py-4 text-sm text-red-600 text-left space-y-1">
          <p className="font-semibold">오류 정보</p>
          <p className="text-xs text-red-400">결제를 다시 시도하거나 고객센터에 문의해주세요.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/courses"
            className="w-full py-3 rounded-2xl ig-gradient text-white font-bold text-sm text-center"
          >
            강의 목록으로
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-2xl border border-neutral-200 text-neutral-700 font-semibold text-sm text-center hover:bg-neutral-50"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
