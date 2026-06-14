import { parseUnsubscribeToken } from "@/lib/crm/unsubscribe-token";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? parseUnsubscribeToken(token) : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-100 p-8">
        <h1 className="text-xl font-black text-neutral-900 mb-2">수신 거부</h1>
        {!token && (
          <p className="text-sm text-neutral-500">올바른 링크로 접속해주세요.</p>
        )}
        {token && !email && (
          <p className="text-sm text-red-500">토큰이 유효하지 않습니다.</p>
        )}
        {token && email && <UnsubscribeForm token={token} email={email} />}
      </div>
    </main>
  );
}
