import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

const DESCRIPTION_HTML = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;color:#111;line-height:1.7;">

  <!-- 긴급 배너 -->
  <div style="background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:20px 24px;border-radius:16px;text-align:center;margin-bottom:48px;">
    <p style="font-weight:800;font-size:15px;margin:0 0 10px;">⚠️ 이 페이지를 나가면, 지금 보고 계신 이 가격으론 구매할 수 없을 수 있습니다!</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;font-size:13px;opacity:.9;">
      <span>✓ 다음 기수 가격 상승</span>
      <span>✓ 선착순 100명 마감</span>
      <span>✓ 다음 기수는 할인 없이 개강</span>
    </div>
  </div>

  <!-- ① 강사 실패 스토리 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">사실 저도 처음부터 잘한 건 아니었습니다</p>
    <h2 style="font-size:24px;font-weight:900;margin:0 0 20px;line-height:1.4;">계속된 실패..<br>근데 누군가는 인스타그램으로<br>돈을 벌고 있어요?</h2>
    <p style="color:#555;font-size:14px;margin-bottom:16px;">1일 1포스팅을 꾸준히 했습니다. 릴스도 만들었습니다. 해시태그도 달았습니다.<br>그런데 팔로워는 늘지 않고, 댓글도 없고, 수익은 0원이었어요.</p>
    <p style="color:#555;font-size:14px;margin-bottom:16px;">그러다 어느 날 이런 생각이 들었습니다.</p>
    <div style="background:#f9fafb;border-left:4px solid #f97316;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
      <p style="font-weight:700;font-size:15px;margin:0;">"근데 누군가는 왜 인스타그램으로 돈을 벌고 있지?"</p>
    </div>
    <p style="color:#555;font-size:14px;">그래서 성공한 인스타그래머들을 하나하나 분석하기 시작했습니다.<br>그들의 프로필, 콘텐츠, 세일즈 방식까지 전부요.</p>
  </div>

  <!-- ② 공통점 발견 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">그들에게는 공통점이 있었습니다</p>
    <h2 style="font-size:22px;font-weight:900;margin:0 0 20px;line-height:1.4;">고객 모임부터 판매까지<br><span style="color:#f97316;">계획된 구조</span>가 있단 것!</h2>
    <p style="color:#555;font-size:14px;margin-bottom:24px;">즉흥적으로 콘텐츠를 올리는 게 아니었어요. 처음 보는 사람이 팔로워가 되고, 팔로워가 고객이 되는 <strong>명확한 흐름</strong>이 있었습니다.</p>

    <div style="background:#111;border-radius:20px;padding:32px 24px;margin-bottom:16px;text-align:center;">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 20px;">그것이 바로</p>
      <div style="display:flex;justify-content:center;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
        <div style="background:#f97316;border-radius:16px;padding:20px 24px;text-align:center;min-width:80px;">
          <div style="font-size:28px;margin-bottom:6px;">🏪</div>
          <p style="color:#fff;font-weight:900;font-size:18px;margin:0;">간판</p>
          <p style="color:#fed7aa;font-size:11px;margin:4px 0 0;">브랜딩</p>
        </div>
        <div style="background:#f97316;border-radius:16px;padding:20px 24px;text-align:center;min-width:80px;">
          <div style="font-size:28px;margin-bottom:6px;">🌀</div>
          <p style="color:#fff;font-weight:900;font-size:18px;margin:0;">미로</p>
          <p style="color:#fed7aa;font-size:11px;margin:4px 0 0;">콘텐츠 전략</p>
        </div>
        <div style="background:#f97316;border-radius:16px;padding:20px 24px;text-align:center;min-width:80px;">
          <div style="font-size:28px;margin-bottom:6px;">🪜</div>
          <p style="color:#fff;font-weight:900;font-size:18px;margin:0;">계단</p>
          <p style="color:#fed7aa;font-size:11px;margin:4px 0 0;">세일즈 구조</p>
        </div>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0;">구조</p>
    </div>

    <p style="color:#555;font-size:14px;">저는 이 구조를 만들고 나서 단 <strong>2주 만에 월 120만원의 수익</strong>을 달성했습니다.<br>그리고 이 경험과 데이터를 기반으로 팁스타그램이 탄생했습니다.</p>
  </div>

  <!-- ③ 팁스타그램 결과 -->
  <div style="background:#f97316;border-radius:20px;padding:32px 24px;margin-bottom:48px;text-align:center;color:#fff;">
    <p style="font-size:13px;opacity:.8;margin:0 0 8px;">그 결과, 팁스타그램은 1년 만에</p>
    <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin:20px 0;">
      <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:16px 20px;">
        <p style="font-size:28px;font-weight:900;margin:0;">19만</p>
        <p style="font-size:12px;opacity:.8;margin:4px 0 0;">팔로워 달성</p>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:16px 20px;">
        <p style="font-size:28px;font-weight:900;margin:0;">6천명+</p>
        <p style="font-size:12px;opacity:.8;margin:4px 0 0;">수강생 달성</p>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:12px;padding:16px 20px;">
        <p style="font-size:28px;font-weight:900;margin:0;">강력한</p>
        <p style="font-size:12px;opacity:.8;margin:4px 0 0;">브랜드 구축</p>
      </div>
    </div>
    <p style="font-size:13px;opacity:.8;margin:0;">가장 강력한 인스타그램 마케팅 브랜드가 되었습니다</p>
  </div>

  <!-- ④ 수강생 성공 사례 - 미숙님 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">실제 수강생 성공 사례</p>
    <h2 style="font-size:22px;font-weight:900;margin:0 0 20px;line-height:1.4;">팁스타그램을 만나<br>변화를 겪은 수강생은<br>이 분만이 아닙니다!</h2>

    <div style="background:#f9fafb;border-radius:16px;padding:24px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="width:48px;height:48px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;flex-shrink:0;">미숙</div>
        <div>
          <p style="font-weight:700;margin:0;font-size:14px;">grace.um_prof · 수강생 미숙님</p>
          <p style="color:#9ca3af;font-size:12px;margin:2px 0 0;">현재 팔로워 4.1만명</p>
        </div>
      </div>
      <p style="color:#555;font-size:14px;margin:0 0 16px;">"수강 전엔 인스타그램을 어떻게 운영해야 할지 막막했어요. 팁스타그램 강의를 듣고 나서 체계적으로 운영하기 시작했고, 게시물 도달이 <strong>890만 이상</strong>을 기록하게 됐습니다. 공구를 통해 2달 만에 <strong>1,800만원 매출</strong>도 달성했어요!"</p>
      <div style="background:#f97316;border-radius:10px;padding:12px 16px;text-align:center;">
        <p style="color:#fff;font-weight:900;font-size:16px;margin:0;">게시물 도달 890만 달성!</p>
      </div>
    </div>

    <!-- 수강생 타입 A~D -->
    <div style="display:grid;gap:12px;">
      <div style="display:flex;align-items:flex-start;gap:12px;background:#f9fafb;border-radius:12px;padding:16px;">
        <div style="width:44px;height:44px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0;">A</div>
        <div>
          <p style="font-weight:700;font-size:13px;color:#f97316;margin:0 0 2px;">수강생 A · 팔로워 3만 달성</p>
          <p style="color:#555;font-size:13px;margin:0;">처음엔 팔로워 200명도 안 됐는데, 강의에서 배운 대로 콘텐츠를 바꾸자 3만 명을 넘었어요.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;background:#f9fafb;border-radius:12px;padding:16px;">
        <div style="width:44px;height:44px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0;">B</div>
        <div>
          <p style="font-weight:700;font-size:13px;color:#f97316;margin:0 0 2px;">수강생 B · 매출 2배 증가</p>
          <p style="color:#555;font-size:13px;margin:0;">인스타 운영법을 바꾸자마자 같은 제품인데 매출이 2배로 올랐습니다.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;background:#f9fafb;border-radius:12px;padding:16px;">
        <div style="width:44px;height:44px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0;">C</div>
        <div>
          <p style="font-weight:700;font-size:13px;color:#f97316;margin:0 0 2px;">수강생 C · 월등한 성과 달성</p>
          <p style="color:#555;font-size:13px;margin:0;">경쟁자들과 비교했을 때 압도적인 차이가 생겼어요. 알고리즘을 이해하는 게 핵심이더라고요.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;background:#f9fafb;border-radius:12px;padding:16px;">
        <div style="width:44px;height:44px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0;">D</div>
        <div>
          <p style="font-weight:700;font-size:13px;color:#f97316;margin:0 0 2px;">수강생 D · 1주 만에 첫 매출</p>
          <p style="color:#555;font-size:13px;margin:0;">강의 시작 1주일 만에 처음으로 인스타를 통해 매출이 발생했습니다!</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ⑤ 20대~70대 누구든 -->
  <div style="margin-bottom:48px;">
    <div style="background:#111;border-radius:20px;padding:28px 24px;text-align:center;margin-bottom:20px;">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;">20대부터 70대까지</p>
      <p style="color:#fff;font-weight:900;font-size:22px;margin:0 0 16px;">나와 상관 없어?</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">스포츠, 소일거리, 인테리어, 카페, 다이어트,<br>홈케어, 뷰티, 육아, 손크라, 마루 등 직종 상관 없이<br>지금 잘 하고 있습니다</p>
    </div>
    <h3 style="font-size:18px;font-weight:900;margin:0 0 12px;">아닙니다!</h3>
    <p style="color:#555;font-size:14px;margin-bottom:16px;">팁스타그램 <strong>70대 수강생</strong>의 이야기를 들려드릴게요.</p>
    <div style="background:#f9fafb;border-radius:16px;padding:24px;border-left:4px solid #f97316;">
      <p style="color:#f97316;font-weight:700;font-size:13px;margin:0 0 8px;">70대 수강생</p>
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0;">"처음엔 스마트폰도 잘 못 다뤘는데, 강의가 너무 쉽게 설명해줘서 그냥 따라 했어요. 매일 3일 포스팅하는 습관이 생기고, 팔로워가 늘기 시작하더니 수강 후 첫 달에 인스타그램을 통해 고객이 생겼습니다. 이제는 릴스도 직접 만들어요!"</p>
    </div>
  </div>

  <!-- ⑥ 커리큘럼 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">강의 커리큘럼</p>
    <h2 style="font-size:22px;font-weight:900;margin:0 0 24px;line-height:1.4;">인스타그램 수익화 강의<br>여기서 종결합니다</h2>

    <div style="display:grid;gap:8px;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">01</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">인스타 프로필 만들기</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">인스타그램 세팅 필수 사항 · 팔로워가 모이는 프로필 작성법 · 프로페셔널 계정 전환 · 하이라이트 전략 · 기업 제안 요청 방법</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">02</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">인스타그램 게시물 작성법</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">알고리즘에 노출되는 게시물 형식 · 반응을 높이는 캡션 작성 · 해시태그 전략 · 최적 업로드 시간 · 저장&공유를 부르는 콘텐츠</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">03</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">릴스 부스터</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">팔로워를 폭발적으로 늘리는 릴스 기획 · 릴스 제작 핵심 노하우 · 알고리즘 공략법 · 바이럴 릴스 사례 분석 · 쇼츠&릴스 연동</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">04</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">세일즈 페이지 만들기</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">구매 전환율을 높이는 페이지 구조 · 고객 심리를 이용한 설득 전략 · 신뢰를 주는 후기 활용법 · 원클릭 구매 동선</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">05</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">카피라이팅 비법</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">마음을 움직이는 카피 공식 · 제품별 카피 작성 실습 · 클릭을 부르는 제목 작성법 · 감정을 자극하는 스토리텔링</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">06</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">카카오 & 링크 활용</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">카카오 채널 연동법 · 링크 인 바이오 최적화 · 오픈채팅방 운영 전략 · 자동화 DM 세팅</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">07</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">라이브 방송 마케팅</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">라이브 방송으로 즉시 매출 올리기 · 라이브 전 준비 사항 · 시청자를 구매자로 전환하는 멘트 · 라이브 후 팔로업</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">08</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">브랜딩과 아이덴티티 만들기</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">기억에 남는 브랜드 색깔 정하기 · 피드 통일감 꾸미기 · 나만의 콘텐츠 세계관 구축 · 브랜드 스토리 만들기</p>
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#f97316;padding:12px 16px;display:flex;align-items:center;gap:10px;">
          <span style="background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;">09</span>
          <span style="color:#fff;font-weight:700;font-size:14px;">자동 매출 시스템 만들기</span>
        </div>
        <div style="padding:14px 16px;background:#fff;">
          <p style="color:#6b7280;font-size:13px;margin:0;">자는 동안에도 팔리는 구조 설계 · 상품 페이지 고객 유입법 · 소상공인 브랜드 매출 자동화 · 월 반복 수익 시스템</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ⑦ 타사 비교 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">비교해보세요</p>
    <h2 style="font-size:22px;font-weight:900;margin:0 0 24px;line-height:1.4;">다른 강의와 비교하지 마세요!<br><span style="color:#f97316;">비교 자체가 불가한 수준</span></h2>

    <div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:24px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#f3f4f6;padding:12px 0;text-align:center;">
        <p style="font-size:12px;font-weight:700;color:#6b7280;margin:0;">항목</p>
        <p style="font-size:12px;font-weight:700;color:#6b7280;margin:0;">타사 인스타 강의</p>
        <p style="font-size:12px;font-weight:700;color:#f97316;margin:0;">팁스타그램 ✓</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">수익화 전략</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;background:#f9fafb;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">무제한 Q&amp;A</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">커뮤니티 운영</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;background:#f9fafb;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">라이브 방송 전략</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">세일즈 페이지 제작</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:11px 0;text-align:center;border-top:1px solid #f3f4f6;background:#f9fafb;"><p style="font-size:12px;color:#374151;margin:0;padding:0 8px;">자동 매출 시스템</p><p style="color:#ef4444;font-weight:700;margin:0;">✕</p><p style="color:#f97316;font-weight:700;margin:0;">✓</p></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="background:#f3f4f6;border-radius:16px;padding:20px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;">타사 인스타 강의</p>
        <p style="font-size:22px;font-weight:900;color:#9ca3af;text-decoration:line-through;margin:0;">월 수십만원</p>
        <p style="font-size:11px;color:#9ca3af;margin:6px 0 0;">Q&amp;A 없음 · 커뮤니티 없음</p>
      </div>
      <div style="background:#f97316;border-radius:16px;padding:20px;text-align:center;">
        <p style="font-size:12px;color:rgba(255,255,255,.7);margin:0 0 6px;">팁스타그램</p>
        <p style="font-size:22px;font-weight:900;color:#fff;margin:0;">월 3,300원</p>
        <p style="font-size:11px;color:rgba(255,255,255,.7);margin:6px 0 0;">무제한 Q&amp;A · 커뮤니티 포함</p>
      </div>
    </div>
  </div>

  <!-- ⑧ 시크릿 혜택 12가지 -->
  <div style="margin-bottom:48px;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:8px;">수강생에게만 제공하는</p>
    <h2 style="font-size:22px;font-weight:900;margin:0 0 24px;">시크릿 혜택 12가지</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">🎬</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">전체 영상 강의</p><p style="font-size:12px;color:#9ca3af;margin:0;">언제 어디서나 반복 시청</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">💬</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">무제한 Q&amp;A</p><p style="font-size:12px;color:#9ca3af;margin:0;">궁금한 것은 무엇이든 질문</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">👥</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">수강생 커뮤니티</p><p style="font-size:12px;color:#9ca3af;margin:0;">함께 성장하는 오픈채팅방</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">📝</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">카피라이팅 템플릿</p><p style="font-size:12px;color:#9ca3af;margin:0;">바로 쓸 수 있는 카피 제공</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">📊</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">세일즈 페이지 예시</p><p style="font-size:12px;color:#9ca3af;margin:0;">실제 판매 페이지 예시 자료</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">🔴</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">라이브 방송 특강</p><p style="font-size:12px;color:#9ca3af;margin:0;">정기적인 라이브 Q&amp;A</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">📱</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">릴스 기획 템플릿</p><p style="font-size:12px;color:#9ca3af;margin:0;">바이럴 릴스 기획서</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">🎯</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">타겟 설정 가이드</p><p style="font-size:12px;color:#9ca3af;margin:0;">나의 고객을 정의하는 워크시트</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">💰</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">수익화 로드맵</p><p style="font-size:12px;color:#9ca3af;margin:0;">단계별 인스타 수익화 로드맵</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">⚡</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">20일 챌린지</p><p style="font-size:12px;color:#9ca3af;margin:0;">수강 후 20일 실천 챌린지</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">📈</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">성과 분석 도구</p><p style="font-size:12px;color:#9ca3af;margin:0;">인사이트 분석 체크리스트</p></div>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #e5e7eb;"><p style="font-size:22px;margin:0 0 6px;">🏆</p><p style="font-weight:700;font-size:13px;margin:0 0 3px;">수강 완료 인증서</p><p style="font-size:12px;color:#9ca3af;margin:0;">수료증 발급</p></div>
    </div>
  </div>

  <!-- ⑨ 최종 CTA -->
  <div style="background:#111;border-radius:20px;padding:32px 24px;text-align:center;">
    <p style="color:#f97316;font-weight:700;font-size:13px;margin:0 0 8px;">지금 놓치면 다됩니다</p>
    <h2 style="color:#fff;font-size:26px;font-weight:900;margin:0 0 12px;line-height:1.4;">지금 이 가격,<br>마지막 기회!</h2>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">선착순 수강생 할인이 마감되면</p>
    <p style="color:#9ca3af;font-size:13px;margin:0;">이 가격으로 다시는 구매할 수 없습니다.</p>
  </div>

</div>
`.trim();

export async function POST() {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findFirst({ where: { slug: "marketing-booster" } });
  if (!product) return NextResponse.json({ error: "marketing-booster 상품을 찾을 수 없습니다." }, { status: 404 });

  await prisma.product.update({
    where: { id: product.id },
    data: { description: DESCRIPTION_HTML },
  });

  return NextResponse.json({ ok: true, message: "상세 설명이 업데이트되었습니다." });
}
