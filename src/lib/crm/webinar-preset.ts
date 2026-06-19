import type { WebinarStep } from "./webinar-engine";

const WRAP = (innerHtml: string) => `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.75;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  ${innerHtml}
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    팁스타그램 · 본 메일은 무료 라이브 신청자에게 자동 발송됩니다.<br/>
    수신을 원하지 않으시면 <a href="https://tipstagram-homepage.vercel.app/unsubscribe" style="color:#999;">수신 거부</a>해 주세요.
  </p>
</div>`.trim();

/**
 * 사용자 요청 + 권장 보강 11 step.
 * subject·body는 빌더에서 수정 가능. 본문에 변수 자동 치환.
 */
export const PRESET_STEPS: WebinarStep[] = [
  {
    kind: "webinar",
    offsetDays: -10,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] {{name}}님, 라이브 주제 공개합니다",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-10</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">"인스타 팔로워 5만 + 수익 2배" 만드는 법</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{name}}님 안녕하세요.<br/>
      {{webinarDate}}에 진행할 무료 라이브 주제를 미리 공유드립니다.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">라이브에서는 1년 만에 0 → 12만 팔로워 · 6억 수익을 만든 구조를 그대로 공개합니다.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{ebook1Url}}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">📥 라이브 전 워밍업 · 1차 전자책 다운로드</a>
      </p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: -7,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] 1차 전자책 핵심 인사이트 하나",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-7</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">"노출은 알고리즘이 아니라 구조다"</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{name}}님, 1차 전자책에서 가장 많이 캡처된 페이지가 어디인지 아세요?<br/>
      바로 "왜 내 게시물은 30명만 보는가" 챕터입니다.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">힌트: 노출은 알고리즘이 정하는 게 아닙니다. <strong>콘텐츠 구조</strong>가 정합니다.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="https://tipstagram-homepage.vercel.app/ebook/step2" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">🎁 2차 전자책 무료 받기</a>
      </p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: -5,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] 0에서 12만까지 — 강사 본인 이야기",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-5</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">처음엔 저도 팔로워 0이었습니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{name}}님, 저는 평범한 직장인이었습니다.<br/>
      그러던 어느 날 인스타그램 한 채널로 1년 만에 12만 팔로워와 6억 수익을 만들었습니다.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">라이브에서는 그 1년의 핵심 변곡점 4가지를 그대로 공개합니다.<br/>
      ① 노출 알고리즘의 진짜 원리 ② 팔로워가 빠르게 늘어나는 구조 ③ 팔로워 → 매출 전환 공식 ④ 오늘 밤부터 적용할 액션.</p>
      <p style="font-size:15px;color:#444;margin:0;">{{webinarDate}} · 줌 라이브로 만나요.</p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: -3,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] 수강생 실적이 증명합니다",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-3</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">"수강 후 진짜로 매출이 바뀌었나요?"</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{name}}님, 가장 많이 받는 질문입니다.<br/>
      그 답은 직접 들어보시는 게 가장 빠릅니다.</p>
      <ul style="font-size:14px;color:#555;line-height:1.9;padding-left:18px;margin:0 0 18px;">
        <li>네일샵 사장님 — 한 콘텐츠로 매출이 5배가 된 후기</li>
        <li>음악학원 원장님 — 학원에 인스타가 어떻게 학생을 데려왔는지</li>
        <li>무속인 — 직종과 상관없이 통하는 시스템</li>
      </ul>
      <p style="font-size:15px;color:#444;margin:0;">라이브에서 더 깊은 사례를 풀어드릴게요. {{daysToWebinar}}일 남았습니다.</p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: -1,
    time: "09:00",
    subject: "[D-1] 내일 저녁 라이브 · 사전 질문 받아요",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-1</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 내일 만나요</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{webinarDate}} · 줌 라이브 안내드립니다.<br/>
      들어오시기 전에, 가장 듣고 싶은 답을 미리 알려주세요.<br/>
      라이브에서 직접 다뤄드릴게요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{preQuestionUrl}}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">📝 사전 질문 보내기</a>
      </p>
      <p style="text-align:center;margin:16px 0;">
        <a href="https://tipstagram-homepage.vercel.app/consultation" style="font-size:13px;color:#FD1D1D;text-decoration:underline;">1:1 진단 세션 신청하기 →</a>
      </p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: 0,
    time: "19:00",
    subject: "🔴 1시간 후 라이브 시작 · 입장 링크",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">LIVE</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 1시간 후 시작합니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 20px;">노트와 펜 준비해주세요. 라이브 중 채팅으로 자유롭게 질문하셔도 됩니다.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{zoomUrl}}" style="display:inline-block;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:16px;">▶ 라이브 입장하기</a>
      </p>
      <p style="font-size:13px;color:#666;margin:24px 0 0;">버튼이 안 열리면: <a href="{{zoomUrl}}" style="color:#FD1D1D;word-break:break-all;">{{zoomUrl}}</a></p>
    `),
    transactional: true,
  },
  {
    kind: "webinar",
    offsetDays: 1,
    time: "09:00",
    subject: "어제 라이브 다시보기 · 한시적 공개",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">REPLAY</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 라이브 다시보기 보내드려요</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">어제 라이브 못 보신 분들을 위해 다시보기 링크를 공유합니다.<br/>
      <strong>72시간 한정 공개</strong>이니 빠르게 봐주세요.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;"><strong>핵심 요약 3가지</strong>:</p>
      <ol style="font-size:14px;color:#555;line-height:1.9;padding-left:20px;margin:0 0 16px;">
        <li>노출은 알고리즘이 아니라 콘텐츠 구조</li>
        <li>팔로워가 빠르게 늘어나는 4단계 루틴</li>
        <li>팔로워 → 매출로 가는 세일즈 퍼널 설계</li>
      </ol>
      <p style="font-size:15px;color:#444;margin:0;">강의 자세히 보기 → <a href="https://tipstagram-homepage.vercel.app/courses/marketing-booster" style="color:#FD1D1D;">강의 상세 페이지</a></p>
    `),
  },
  {
    kind: "webinar",
    offsetDays: 2,
    time: "09:00",
    subject: "라이브 본 분들이 가장 많이 한 말",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">FEEDBACK</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">"이걸 진작 알았더라면..."</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">{{name}}님, 라이브 보신 분들이 가장 많이 남긴 말입니다.</p>
      <blockquote style="background:#FFF8EB;border-left:4px solid #FD1D1D;padding:14px 18px;font-size:14px;color:#555;margin:18px 0;border-radius:0 12px 12px 0;">
        "1년 전에 봤다면 지금 매출이 달랐을 것 같아요." — 30대 자영업자<br/><br/>
        "구조가 보이니까 콘텐츠 만들기가 쉬워졌어요." — 1인 사업가<br/><br/>
        "강의 자체보다 마인드셋이 달라졌습니다." — 강사
      </blockquote>
      <p style="font-size:15px;color:#444;margin:0;">아직 강의 자세히 못 보셨다면 → <a href="https://tipstagram-homepage.vercel.app/courses/marketing-booster" style="color:#FD1D1D;">강의 페이지</a></p>
    `),
  },
  {
    kind: "endDate",
    offsetDays: -3,
    time: "09:00",
    subject: "[마감 D-3] 정원이 얼마 남지 않았습니다",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">D-{{daysToEnd}}</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 마감 3일 전입니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">매 기수 100명 한정으로 모집하고 있어, 정원이 거의 다 찼습니다.<br/>
      다음 기수는 한 달 후에 열리며 <strong>수강료가 인상</strong>됩니다.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="https://tipstagram-homepage.vercel.app/courses/marketing-booster" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">남은 자리 확인하기</a>
      </p>
    `),
  },
  {
    kind: "endDate",
    offsetDays: -1,
    time: "09:00",
    subject: "🔴 [마감 D-1] 오늘이 마지막입니다",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">LAST DAY</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 24시간 남았습니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">오늘 자정까지 신청을 받습니다.<br/>
      마감 후엔 한 달 동안 신청이 불가능하며, 다음 기수부터 가격이 올라갑니다.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;"><strong>지금 결정해야 할 단 하나의 이유</strong>:<br/>
      당신의 인스타그램이 오늘 밤부터 달라지기 시작한다는 것.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="https://tipstagram-homepage.vercel.app/courses/marketing-booster" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#FD1D1D;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">🔥 지금 바로 신청</a>
      </p>
    `),
  },
  {
    kind: "endDate",
    offsetDays: 0,
    time: "21:00",
    subject: "이번 기수 모집이 마감되었습니다",
    body: WRAP(`
      <p style="font-size:13px;font-weight:700;color:#777;letter-spacing:3px;margin:0 0 6px;">CLOSED</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 이번 기수가 마감되었습니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">함께해 주신 모든 분들께 감사드립니다.<br/>
      이번 기수는 정원이 모두 차서 신청을 닫았습니다.</p>
      <p style="font-size:15px;color:#444;margin:0 0 16px;">다음 기수 안내를 가장 먼저 받고 싶으시면 아래에서 대기 신청을 해주세요.<br/>
      (수강료 인상 전에 별도 안내드릴게요.)</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="https://tipstagram-homepage.vercel.app/live" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">다음 기수 대기 신청</a>
      </p>
    `),
  },
];
