import type { WebinarStep } from "./webinar-engine";

const SITE = "https://tipstagram-homepage.vercel.app";

const FOOTER = `
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    팁스타그램 · 본 메일은 무료 라이브 신청자에게 자동 발송됩니다.<br/>
    수신을 원하지 않으시면 <a href="${SITE}/unsubscribe" style="color:#999;">수신 거부</a>해 주세요.
  </p>`;

/**
 * 편지 톤 메일 — 강사가 직접 쓴 1인칭 편지. 그라디언트 헤더선만 얇게.
 * 좌측 정렬 본문, 큰 카드/표 없음. 사인오프 "팁스타그램 드림" 포함.
 */
const LETTER = (innerHtml: string) => `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;color:#222;line-height:1.85;font-size:15px;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:3px;border-radius:3px;margin-bottom:28px;"></div>
  ${innerHtml}
  <p style="font-size:14px;color:#555;margin:28px 0 0;">— 팁스타그램 드림</p>
  ${FOOTER}
</div>`.trim();

/**
 * 정보형 카드 톤 — 라이브 직전·다시보기 등 명확한 행동 유도가 필요한 메일에만.
 */
const CARD = (innerHtml: string) => `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.75;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  ${innerHtml}
  ${FOOTER}
</div>`.trim();

/**
 * 12 step 시퀀스 — 강사 편지 톤 + 거절 이유 대응 + D-2 신설.
 * subject/body는 어드민 빌더에서 수정 가능. {{name}}, {{daysToWebinar}}, {{daysToEnd}},
 * {{webinarDate}}, {{ebook1Url}}, {{zoomUrl}}, {{preQuestionUrl}}, {{consultationUrl}} 자동 치환.
 */
export const PRESET_STEPS: WebinarStep[] = [
  // ───────────── 0. D-10 환영 편지 ─────────────
  {
    kind: "webinar",
    offsetDays: -10,
    time: "09:00",
    subject: "{{name}}님, 만나서 반갑습니다 (라이브까지 D-{{daysToWebinar}})",
    body: LETTER(`
      <p>{{name}}님, 안녕하세요.</p>
      <p>먼저 무료 라이브에 신청해 주셔서 감사해요. 저는 팁스타그램입니다.</p>
      <p>요즘 메일함을 열면 광고가 너무 많죠. 그래서 저는 이번 시리즈를 <strong>제 입으로 직접 말씀드리듯</strong> 짧게 짧게 보내려고 해요. 부담 갖지 마시고 편하게 읽어주세요.</p>
      <p>{{webinarDate}}에 있을 라이브에서, 제가 인스타 한 채널로 어떻게 결과를 만들어왔는지 그 <strong>전 과정</strong>을 공개합니다. 광고비는 0원이었습니다.</p>
      <p>라이브까지 10일 남았어요. 그 사이에 9통 정도 메일이 더 갈 거예요. 모두 라이브 안에서 더 잘 받아가실 수 있도록 준비하는 내용이에요.</p>
      <p>오늘은 그냥 워밍업 한 권만 두고 갑니다. 가볍게 한 번 훑어봐 주세요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{ebook1Url}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">1차 전자책 받기 →</a>
      </p>
    `),
  },

  // ───────────── 1. D-7 거절① "정말 무료인가요?" + 1차 전자책 인사이트 ─────────────
  {
    kind: "webinar",
    offsetDays: -7,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] \"정말 공짜인가요?\" 답장에 답합니다",
    body: LETTER(`
      <p>{{name}}님, 어제 답장 한 통을 받았어요.</p>
      <blockquote style="border-left:3px solid #FD1D1D;padding:6px 14px;margin:14px 0;color:#555;font-style:italic;font-size:14px;">
        "이거 진짜 무료 맞나요? 뒤에 뭐 결제하라고 하는 거 아니에요?"
      </blockquote>
      <p>충분히 의심하실 만해요. 그래서 명확히 말씀드릴게요.</p>
      <p><strong>라이브는 결제도, 카드 등록도, 어떤 비용도 없습니다.</strong> 광고비를 들이지 않고도 충분히 결과가 나온다는 걸 보여드리는 자리라, 그 자체가 광고비 없는 자리예요.</p>
      <p>그리고 한 가지 더. 1차 전자책에서 가장 많이 캡처되는 페이지가 어딘 줄 아세요? <strong>"왜 내 게시물은 30명만 보는가"</strong> 챕터예요.</p>
      <p>거기 한 줄로 적혀 있어요. <strong>"노출은 알고리즘이 아니라 콘텐츠 구조가 정한다"</strong>고요. 이 한 줄이 왜 그렇게 많은 분들 마음에 남았는지, 라이브에서 직접 풀어드릴게요.</p>
    `),
  },

  // ───────────── 2. D-5 강사 개인 스토리 ─────────────
  {
    kind: "webinar",
    offsetDays: -5,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] 제가 처음 인스타를 켠 날 이야기",
    body: LETTER(`
      <p>{{name}}님, 오늘은 짧은 제 이야기 하나만 두고 갈게요.</p>
      <p>제가 처음 인스타를 시작했을 때 팔로워는 0이었어요. 사진도 못 찍었고, 글도 못 썼어요. 솔직히 부끄러웠어요.</p>
      <p>처음 6개월 동안 팔로워가 200명 늘었어요. 한 달에 33명. 그 속도가 답답해서 거의 그만둘 뻔했어요.</p>
      <p>그러다 우연히 한 가지를 바꿨어요. <strong>"내가 좋아하는 콘텐츠"가 아니라 "사람들이 멈춰서는 콘텐츠"의 구조</strong>로요. 그날 이후 한 달 만에 1만 명이 늘었습니다.</p>
      <p>그 다음은 알고리즘이 일을 했어요. 1년 만에 12만 팔로워. 그리고 누적 6억의 매출. 라이브에선 그 변곡점을 시간 순서대로 다 풀어드려요.</p>
      <p>{{webinarDate}}에 만나요. 사진은 라이브 들어오시면 그때 직접 보여드릴게요.</p>
    `),
  },

  // ───────────── 3. D-4 거절② "저 같은 사람도 될까요?" ─────────────
  {
    kind: "webinar",
    offsetDays: -4,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] \"저 같은 사람도 되나요?\"",
    body: LETTER(`
      <p>{{name}}님, 또 답장 하나가 마음에 남아서 적어요.</p>
      <blockquote style="border-left:3px solid #FD1D1D;padding:6px 14px;margin:14px 0;color:#555;font-style:italic;font-size:14px;">
        "저는 인플루언서도 아니고 그냥 평범한 직장인이에요. 저 같은 사람도 되나요?"
      </blockquote>
      <p>이 질문엔 사례로만 답할 수 있을 것 같아요. 제 수업을 들으신 분들 몇 분만 짧게 소개할게요.</p>
      <ul style="padding-left:18px;margin:14px 0;color:#444;">
        <li><strong>육아 중인 워킹맘</strong> — 아이 재운 밤 11시 ~ 12시 한 시간만 써서 6개월 만에 1만 팔로워.</li>
        <li><strong>지방 동네 네일샵 사장님</strong> — 게시물 한 개로 한 달 매출이 5배.</li>
        <li><strong>현직 회계사</strong> — 본업 유지하면서 N잡으로 인스타 수익만 월 300.</li>
        <li><strong>음악학원 원장님</strong> — 인스타로 학생 모집 줄이 끊긴 적 없음.</li>
      </ul>
      <p>공통점은 한 가지예요. 모두 처음엔 "저는 안 될 것 같은데..."로 시작하셨어요. 라이브에서 더 보여드릴게요.</p>
    `),
  },

  // ───────────── 4. D-3 거절③ "시간이 없어요" ─────────────
  {
    kind: "webinar",
    offsetDays: -3,
    time: "09:00",
    subject: "[D-{{daysToWebinar}}] \"바빠서 라이브를 못 들을 것 같아요\"",
    body: LETTER(`
      <p>{{name}}님, 오늘은 짧게요.</p>
      <blockquote style="border-left:3px solid #FD1D1D;padding:6px 14px;margin:14px 0;color:#555;font-style:italic;font-size:14px;">
        "그날 바빠서 라이브에 못 들어갈 것 같아요. 신청 취소해야 하나요?"
      </blockquote>
      <p>그러지 마세요. 두 가지만 말씀드릴게요.</p>
      <p><strong>하나</strong>. 라이브는 1시간 30분이지만, 사실 <strong>30분만 들으셔도 핵심은 다 가져가십니다.</strong> 첫 30분에 알고리즘·구조·실행 액션을 다 담아둬요. 뒤는 Q&amp;A와 사례예요.</p>
      <p><strong>둘</strong>. 못 들어오셔도 괜찮아요. <strong>참여자분들께만 다시보기 링크</strong>를 72시간 동안 보내드립니다. 자기 전에, 출근길에 들으셔도 돼요.</p>
      <p>그러니까 일단 신청만 살아 있게 두세요. 그게 가장 안전한 선택이에요.</p>
    `),
  },

  // ───────────── 5. D-2 마감 48시간 + 사전 질문 ─────────────
  {
    kind: "webinar",
    offsetDays: -2,
    time: "09:00",
    subject: "[D-2] 48시간 남았어요 — 가장 궁금한 것 하나만 알려주세요",
    body: LETTER(`
      <p>{{name}}님, 라이브까지 48시간 남았어요.</p>
      <p>지금까지 신청해 주신 분 한 분 한 분의 답장을 다 읽었어요. 가장 많이 받은 질문 셋이에요.</p>
      <ol style="padding-left:18px;margin:14px 0;color:#444;">
        <li>"콘텐츠를 매일 올리는 게 정답인가요?"</li>
        <li>"릴스랑 피드 중 뭘 먼저 해야 하나요?"</li>
        <li>"팔로워가 늘긴 늘었는데 매출은 그대로예요. 뭐가 빠진 거죠?"</li>
      </ol>
      <p>이 셋 다 라이브에서 답해드릴게요. 그런데 {{name}}님 본인의 상황은 또 다르실 거예요. 그래서 부탁 하나만 드릴게요.</p>
      <p><strong>딱 한 가지, 가장 궁금한 걸 미리 알려주세요.</strong> 라이브 중에 이름 익명으로 직접 답해드릴게요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{preQuestionUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:700;text-decoration:none;font-size:14px;">사전 질문 보내기 →</a>
      </p>
      <p>라이브에서 답변받고 싶은 게 더 깊은 분은 <a href="{{consultationUrl}}" style="color:#FD1D1D;">1:1 진단 세션</a>도 열어뒀어요(소수 정원).</p>
    `),
  },

  // ───────────── 6. D-1 입장 안내 ─────────────
  {
    kind: "webinar",
    offsetDays: -1,
    time: "09:00",
    subject: "[D-1] 내일 저녁에 만나요 · 입장 안내",
    body: LETTER(`
      <p>{{name}}님, 드디어 내일이네요.</p>
      <p>입장 안내 짧게 정리해 드려요.</p>
      <ul style="padding-left:18px;margin:14px 0;color:#444;">
        <li><strong>일시</strong>: {{webinarDate}}</li>
        <li><strong>장소</strong>: Zoom (링크는 시작 1시간 전에 다시 보내드려요)</li>
        <li><strong>준비물</strong>: 노트와 펜 (메모하실 분들). 영상 끄셔도 됩니다.</li>
      </ul>
      <p>아직 사전 질문 안 보내셨다면 <a href="{{preQuestionUrl}}" style="color:#FD1D1D;">여기서</a> 한 줄만 적어주세요. 라이브 중에 직접 답해드려요.</p>
      <p>내일 만나요.</p>
    `),
  },

  // ───────────── 7. LIVE 1시간 전 (긴급, transactional) ─────────────
  {
    kind: "webinar",
    offsetDays: 0,
    time: "19:00",
    subject: "🔴 1시간 후 시작합니다 · 입장 링크",
    body: CARD(`
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">LIVE · 1H BEFORE</p>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 1시간 후 시작합니다</h1>
      <p style="font-size:15px;color:#444;margin:0 0 20px;">노트와 펜 옆에 두세요. 채팅으로 질문 자유롭게 받습니다.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{zoomUrl}}" style="display:inline-block;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:16px;">▶ 라이브 입장하기</a>
      </p>
      <p style="font-size:13px;color:#666;margin:24px 0 0;">버튼이 안 열리면: <a href="{{zoomUrl}}" style="color:#FD1D1D;word-break:break-all;">{{zoomUrl}}</a></p>
    `),
    transactional: true,
  },

  // ───────────── 8. D+1 다시보기 ─────────────
  {
    kind: "webinar",
    offsetDays: 1,
    time: "09:00",
    subject: "어제 와주셔서 고마워요 · 다시보기 72시간 한정",
    body: LETTER(`
      <p>{{name}}님, 어제 라이브에 함께해 주셔서 정말 고마웠어요.</p>
      <p>제가 처음 인스타를 시작했던 때를 떠올리면, 그때 누가 옆에서 라이브 한 번만 풀어줬어도 1년은 아꼈을 것 같아요. 어제 그 자리를 함께해 주신 거, 다시 한 번 감사합니다.</p>
      <p>못 보신 분, 도중에 끊긴 분들 위해서 <strong>다시보기를 72시간만 열어둘게요.</strong></p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{zoomUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">다시보기 열기 →</a>
      </p>
      <p>라이브에서 다룬 핵심 세 가지만 짧게 적어둘게요.</p>
      <ol style="padding-left:18px;margin:14px 0;color:#444;">
        <li>노출은 알고리즘이 아니라 콘텐츠 <strong>구조</strong>가 정한다.</li>
        <li>팔로워를 빠르게 늘리는 4단계 루틴.</li>
        <li>팔로워 → 매출로 가는 세일즈 퍼널.</li>
      </ol>
      <p>여기서 멈추지 않게, 다음 단계를 함께 가고 싶으신 분은 <a href="{{salesUrl}}" style="color:#FD1D1D;">강의 페이지</a>도 열어두었어요.</p>
    `),
  },

  // ───────────── 9. 마감 D-3 ─────────────
  {
    kind: "endDate",
    offsetDays: -3,
    time: "09:00",
    subject: "[마감 D-{{daysToEnd}}] 정원 얼마 안 남았어요",
    body: LETTER(`
      <p>{{name}}님, 짧은 안내 드릴게요.</p>
      <p>이번 기수는 매 기수 그래왔듯 <strong>100명 한정</strong>으로 받고 있어요. 제가 한 분 한 분 진도 확인하고 피드백 드리는 구조라 더 늘리지 못해요.</p>
      <p>3일 후에 모집을 닫고, 다음 기수는 한 달 후예요. <strong>다음 기수부터는 수강료가 인상</strong>됩니다.</p>
      <p>아직 망설이고 계시다면, 남은 자리만 한 번 확인해 보세요. 결정은 그 다음에 하셔도 돼요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{salesUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:700;text-decoration:none;font-size:14px;">남은 자리 확인 →</a>
      </p>
    `),
  },

  // ───────────── 10. 마감 D-1 ─────────────
  {
    kind: "endDate",
    offsetDays: -1,
    time: "09:00",
    subject: "🔴 [마감 D-1] 오늘 자정까지예요",
    body: LETTER(`
      <p>{{name}}님, 솔직히 말씀드릴게요.</p>
      <p>마감을 앞두고 이런 메일 보내는 게 저도 부담스러워요. 그래도 한 번만 드리는 이유는 한 가지예요.</p>
      <p>이번 기수를 놓치면 <strong>한 달을 더 기다리셔야 하고, 그땐 가격이 오릅니다.</strong> 그 사이 인스타는 또 알고리즘이 바뀔 거예요.</p>
      <p>한 달 후 같은 자리에서 다시 망설이는 자신을 보고 싶지 않으시다면, 오늘이 마지막이에요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="{{salesUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#FD1D1D;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">오늘 자정 전 신청 →</a>
      </p>
      <p>결정은 {{name}}님의 것이에요. 응원합니다.</p>
    `),
  },

  // ───────────── 11. 마감 직후 ─────────────
  {
    kind: "endDate",
    offsetDays: 0,
    time: "21:00",
    subject: "이번 기수 마감 · 다음 기수 안내",
    body: LETTER(`
      <p>{{name}}님, 이번 기수 모집이 방금 마감되었어요.</p>
      <p>이번에 함께해 주신 모든 분께 감사드려요. 못 함께해서 아쉬운 분들도 계실 거예요. 솔직히 저도 아쉬워요.</p>
      <p>다음 기수는 한 달 후예요. <strong>가격이 인상되기 전 안내</strong>를 가장 먼저 받고 싶으신 분은 아래에서 대기 신청을 해두세요.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${SITE}/live" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">다음 기수 대기 신청 →</a>
      </p>
      <p>그 동안 1차 전자책이라도 한 번 더 펼쳐보세요. 거기 답이 꽤 많이 들어있어요.</p>
    `),
  },
];
