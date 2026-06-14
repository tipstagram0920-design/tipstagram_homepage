"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Radio,
  UserPlus,
  CheckCircle2,
  Send,
  Tag,
  StickyNote,
  Loader2,
  Ban,
  PencilLine,
  ExternalLink,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface ContactProps {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  note: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  consentEmail: boolean;
  consentSms: boolean;
  unsubscribedAt: string | null;
  liveSignupCount: number;
  purchaseCount: number;
  totalSpent: number;
  userRole: string | null;
  userTags: string[];
  userId: string | null;
}

interface Event {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

interface Purchase {
  id: string;
  productTitle: string;
  productSlug: string;
  amount: number;
  orderId: string;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  completedAt: string;
}

interface MessageLog {
  id: string;
  channel: string;
  provider: string;
  to: string;
  subject: string | null;
  status: string;
  error: string | null;
  templateKey: string | null;
  sentAt: string;
}

const EVENT_LABEL: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  live_signup: { label: "라이브 신청", icon: Radio, color: "text-amber-500 bg-amber-50" },
  register: { label: "회원가입", icon: UserPlus, color: "text-blue-500 bg-blue-50" },
  purchase: { label: "구매 완료", icon: ShoppingBag, color: "text-emerald-500 bg-emerald-50" },
  lesson_complete: { label: "강의 완료", icon: CheckCircle2, color: "text-purple-500 bg-purple-50" },
  email_sent: { label: "메일 발송", icon: Send, color: "text-neutral-500 bg-neutral-50" },
  kakao_sent: { label: "알림톡 발송", icon: Send, color: "text-yellow-500 bg-yellow-50" },
  sms_sent: { label: "문자 발송", icon: Send, color: "text-neutral-500 bg-neutral-50" },
  tag_added: { label: "태그 추가", icon: Tag, color: "text-purple-500 bg-purple-50" },
  manual_note: { label: "메모", icon: StickyNote, color: "text-neutral-500 bg-neutral-50" },
  unsubscribe: { label: "수신 거부", icon: Ban, color: "text-red-500 bg-red-50" },
};

function payloadSummary(type: string, p: Record<string, unknown>): string {
  if (type === "purchase") {
    const title = p.productTitle as string | undefined;
    const amount = p.amount as number | undefined;
    return [title, amount ? formatPrice(amount) : null].filter(Boolean).join(" · ");
  }
  if (type === "lesson_complete") return (p.lessonTitle as string) ?? "";
  if (type === "email_sent" || type === "kakao_sent" || type === "sms_sent") return (p.templateKey as string) ?? "";
  if (type === "tag_added") {
    const tags = p.tags as string[] | undefined;
    return tags?.join(", ") ?? "";
  }
  return "";
}

export function ContactDetailClient({
  contact,
  events,
  purchases,
  completedLessons,
  messages,
}: {
  contact: ContactProps;
  events: Event[];
  purchases: Purchase[];
  completedLessons: Lesson[];
  messages: MessageLog[];
}) {
  const router = useRouter();
  const [note, setNote] = useState(contact.note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [unsub, setUnsub] = useState(!!contact.unsubscribedAt);
  const [tab, setTab] = useState<"timeline" | "purchases" | "lessons" | "messages">("timeline");

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await fetch(`/api/admin/crm/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      router.refresh();
    } finally {
      setSavingNote(false);
    }
  };

  const toggleUnsub = async () => {
    const next = !unsub;
    setUnsub(next);
    await fetch(`/api/admin/crm/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unsubscribe: next }),
    });
    router.refresh();
  };

  return (
    <div>
      <button
        onClick={() => router.push("/admin/crm/contacts")}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> 컨택트 목록
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 좌측 프로필 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full ig-gradient flex items-center justify-center text-white text-xl font-black shrink-0">
                {(contact.name?.[0] || contact.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 truncate">{contact.name || "이름 없음"}</p>
                <p className="text-xs text-neutral-500 truncate">{contact.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-xs">최초 {formatDate(new Date(contact.firstSeenAt))}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {contact.source && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  유입: {contact.source}
                </span>
              )}
              {contact.userRole && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">
                  {contact.userRole === "ADMIN" ? "관리자" : "회원"}
                </span>
              )}
              {!contact.userRole && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">리드</span>
              )}
              {contact.userTags.map((t) => (
                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* 카운터 */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-black text-neutral-900">{contact.liveSignupCount}</div>
              <p className="text-xs text-neutral-500 mt-0.5">라이브</p>
            </div>
            <div>
              <div className="text-xl font-black text-neutral-900">{contact.purchaseCount}</div>
              <p className="text-xs text-neutral-500 mt-0.5">구매</p>
            </div>
            <div>
              <div className="text-xl font-black ig-gradient-text">{contact.totalSpent > 0 ? formatPrice(contact.totalSpent) : "-"}</div>
              <p className="text-xs text-neutral-500 mt-0.5">총 결제</p>
            </div>
          </div>

          {/* 회원 빠른 액션 (User가 연결된 경우만) */}
          {contact.userId && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-5">
              <h4 className="text-sm font-bold text-neutral-900 mb-3">회원 액션</h4>
              <div className="space-y-2">
                <Link
                  href={`/admin/users/${contact.userId}/edit`}
                  className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                >
                  <span className="inline-flex items-center gap-2">
                    <PencilLine className="w-3.5 h-3.5" /> 회원 정보 수정
                  </span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </Link>
                <Link
                  href={`/admin/users/${contact.userId}/add-product`}
                  className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" /> 강의 수동 부여
                  </span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </Link>
              </div>
            </div>
          )}

          {/* Consent / Unsub */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h4 className="text-sm font-bold text-neutral-900 mb-3">수신 동의</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">이메일</span>
                <span className={contact.consentEmail ? "text-emerald-600 font-semibold" : "text-neutral-400"}>
                  {contact.consentEmail ? "동의" : "미동의"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">알림톡·문자</span>
                <span className={contact.consentSms ? "text-emerald-600 font-semibold" : "text-neutral-400"}>
                  {contact.consentSms ? "동의" : "미동의"}
                </span>
              </div>
              <button
                onClick={toggleUnsub}
                className={
                  "w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors " +
                  (unsub ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
                }
              >
                {unsub ? "✓ 수신 거부 상태" : "수신 거부로 변경"}
              </button>
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-neutral-900 inline-flex items-center gap-1.5">
                <PencilLine className="w-3.5 h-3.5" /> 메모
              </h4>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="이 고객에 대한 메모 (예: 8/15 상담, VIP 케어 필요...)"
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-y"
            />
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl ig-gradient text-white text-xs font-bold disabled:opacity-50"
            >
              {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              메모 저장
            </button>
          </div>
        </div>

        {/* 우측 — 탭 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="flex border-b border-neutral-100">
              {[
                ["timeline", `타임라인 (${events.length})`],
                ["purchases", `구매 (${purchases.length})`],
                ["lessons", `완강 (${completedLessons.length})`],
                ["messages", `발송 (${messages.length})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key as typeof tab)}
                  className={
                    "flex-1 px-4 py-3 text-sm font-semibold transition-colors " +
                    (tab === key
                      ? "text-pink-600 border-b-2 border-pink-500"
                      : "text-neutral-500 hover:text-neutral-900")
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "timeline" && (
                <div className="space-y-3">
                  {events.length === 0 && <p className="text-sm text-neutral-400 text-center py-10">아직 활동 기록이 없습니다.</p>}
                  {events.map((e) => {
                    const meta = EVENT_LABEL[e.type] ?? { label: e.type, icon: Mail, color: "text-neutral-500 bg-neutral-50" };
                    const Icon = meta.icon;
                    return (
                      <div key={e.id} className="flex gap-3 items-start">
                        <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + meta.color}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1 pb-3 border-b border-neutral-50">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-sm text-neutral-900">{meta.label}</p>
                            <span className="text-xs text-neutral-400 shrink-0">{formatDate(new Date(e.occurredAt))}</span>
                          </div>
                          {payloadSummary(e.type, e.payload) && (
                            <p className="text-xs text-neutral-600 mt-0.5 truncate">{payloadSummary(e.type, e.payload)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "purchases" && (
                <div className="space-y-2.5">
                  {purchases.length === 0 && <p className="text-sm text-neutral-400 text-center py-10">구매 내역이 없습니다.</p>}
                  {purchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-100 hover:border-pink-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{p.productTitle}</p>
                        <p className="text-xs text-neutral-500">{p.orderId} · {formatDate(new Date(p.createdAt))}</p>
                      </div>
                      <p className="text-sm font-bold ig-gradient-text shrink-0 ml-3">{formatPrice(p.amount)}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "lessons" && (
                <div className="space-y-2">
                  {completedLessons.length === 0 && <p className="text-sm text-neutral-400 text-center py-10">완강한 강의가 없습니다.</p>}
                  {completedLessons.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-sm text-neutral-700 flex-1 truncate">{l.title}</p>
                      <span className="text-xs text-neutral-400 shrink-0">{formatDate(new Date(l.completedAt))}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "messages" && (
                <div className="space-y-2.5">
                  {messages.length === 0 && <p className="text-sm text-neutral-400 text-center py-10">발송 이력이 없습니다.</p>}
                  {messages.map((m) => (
                    <div key={m.id} className="px-4 py-3 rounded-xl border border-neutral-100">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 uppercase">
                            {m.channel}
                          </span>
                          <span
                            className={
                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase " +
                              (m.status === "sent" ? "bg-emerald-50 text-emerald-600"
                                : m.status === "failed" ? "bg-red-50 text-red-600"
                                : m.status === "blocked" ? "bg-amber-50 text-amber-600"
                                : "bg-neutral-100 text-neutral-600")
                            }
                          >
                            {m.status}
                          </span>
                          {m.templateKey && (
                            <span className="text-xs text-neutral-500 font-mono">{m.templateKey}</span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400 shrink-0">{formatDate(new Date(m.sentAt))}</span>
                      </div>
                      <p className="text-sm text-neutral-800 truncate">{m.subject || "(제목 없음)"}</p>
                      {m.error && <p className="text-xs text-red-500 mt-1">{m.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
