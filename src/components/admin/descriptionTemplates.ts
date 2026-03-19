export interface DescriptionTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
}

export const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
  {
    id: "minimal",
    name: "미니멀형",
    description: "깔끔한 섹션 구분, 핵심 정보 중심",
    html: `<div style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; color: #1a1a1a; line-height: 1.8; max-width: 720px;">

  <!-- 한 줄 소개 -->
  <p style="font-size: 20px; font-weight: 700; color: #f97316; margin: 0 0 32px;">
    📌 이 강의 한 줄 요약
  </p>
  <p style="font-size: 17px; color: #333; margin: 0 0 48px; padding: 20px 24px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px;">
    강의 핵심 메시지를 여기에 입력하세요.
  </p>

  <!-- 이런 분께 추천 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">🎯 이런 분께 추천해요</p>
  <ul style="list-style: none; padding: 0; margin: 0 0 48px; display: flex; flex-direction: column; gap: 10px;">
    <li style="display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #444;">
      <span style="color: #f97316; font-weight: 700; flex-shrink: 0;">✓</span> 추천 대상 1
    </li>
    <li style="display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #444;">
      <span style="color: #f97316; font-weight: 700; flex-shrink: 0;">✓</span> 추천 대상 2
    </li>
    <li style="display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #444;">
      <span style="color: #f97316; font-weight: 700; flex-shrink: 0;">✓</span> 추천 대상 3
    </li>
  </ul>

  <!-- 배우는 것 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">📚 배우는 내용</p>
  <div style="display: grid; gap: 12px; margin-bottom: 48px;">
    <div style="padding: 16px 20px; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
      <p style="font-size: 15px; font-weight: 700; color: #f97316; margin: 0 0 4px;">챕터 1 제목</p>
      <p style="font-size: 14px; color: #666; margin: 0;">챕터 내용 설명</p>
    </div>
    <div style="padding: 16px 20px; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
      <p style="font-size: 15px; font-weight: 700; color: #f97316; margin: 0 0 4px;">챕터 2 제목</p>
      <p style="font-size: 14px; color: #666; margin: 0;">챕터 내용 설명</p>
    </div>
    <div style="padding: 16px 20px; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
      <p style="font-size: 15px; font-weight: 700; color: #f97316; margin: 0 0 4px;">챕터 3 제목</p>
      <p style="font-size: 14px; color: #666; margin: 0;">챕터 내용 설명</p>
    </div>
  </div>

  <!-- 수강 후 변화 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">✨ 수강 후 이렇게 달라져요</p>
  <div style="display: grid; gap: 12px; margin-bottom: 48px;">
    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff7ed; border-radius: 12px;">
      <span style="font-size: 28px;">😫</span>
      <div>
        <p style="font-size: 13px; color: #999; margin: 0 0 2px;">수강 전</p>
        <p style="font-size: 15px; color: #555; margin: 0;">수강 전 고민/문제</p>
      </div>
      <span style="font-size: 20px; color: #f97316; margin: 0 8px;">→</span>
      <div>
        <p style="font-size: 13px; color: #f97316; margin: 0 0 2px;">수강 후</p>
        <p style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0;">수강 후 변화/결과</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff7ed; border-radius: 12px;">
      <span style="font-size: 28px;">😩</span>
      <div>
        <p style="font-size: 13px; color: #999; margin: 0 0 2px;">수강 전</p>
        <p style="font-size: 15px; color: #555; margin: 0;">수강 전 고민/문제</p>
      </div>
      <span style="font-size: 20px; color: #f97316; margin: 0 8px;">→</span>
      <div>
        <p style="font-size: 13px; color: #f97316; margin: 0 0 2px;">수강 후</p>
        <p style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0;">수강 후 변화/결과</p>
      </div>
    </div>
  </div>

  <!-- 강사 소개 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">👩‍💼 강사 소개</p>
  <div style="padding: 24px; background: #f9f9f9; border-radius: 16px; margin-bottom: 48px;">
    <p style="font-size: 16px; font-weight: 700; margin: 0 0 8px;">강사 이름</p>
    <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.8;">
      강사 소개 및 경력을 입력하세요. 수강생이 신뢰할 수 있는 경험과 성과 중심으로 작성하면 좋습니다.
    </p>
  </div>

  <!-- CTA -->
  <div style="text-align: center; padding: 40px 24px; background: linear-gradient(135deg, #f97316, #ec4899); border-radius: 20px; color: white;">
    <p style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">지금 바로 시작하세요</p>
    <p style="font-size: 15px; opacity: 0.9; margin: 0;">강의 수강 후 변화를 직접 경험해보세요.</p>
  </div>

</div>`,
  },
  {
    id: "story",
    name: "스토리형",
    description: "강사의 실패→성공 스토리로 공감 유도",
    html: `<div style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; color: #1a1a1a; line-height: 1.9; max-width: 720px;">

  <!-- 공감 후크 -->
  <div style="text-align: center; padding: 40px 24px; margin-bottom: 48px;">
    <p style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 0 0 12px; line-height: 1.4;">
      "열심히 했는데 왜 안 될까?"<br/>
      <span style="color: #f97316;">그 답을 찾았습니다.</span>
    </p>
    <p style="font-size: 16px; color: #666; margin: 0;">저도 똑같은 고민을 했었으니까요.</p>
  </div>

  <!-- 강사 스토리: 실패 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">📖 저의 이야기</p>
  <p style="font-size: 15px; color: #444; margin: 0 0 16px;">
    강사의 실패 경험을 솔직하게 이야기하세요. 수강생이 "나랑 똑같다"고 느낄수록 좋습니다.
    처음에 어떤 어려움이 있었는지, 뭘 시도해봤는지 구체적으로 작성하세요.
  </p>
  <p style="font-size: 15px; color: #444; margin: 0 0 32px;">
    예) 팔로워 300명에서 멈춰버린 계정. 매일 올려도 반응은 없었고, 알고리즘이 원망스러웠습니다.
    콘텐츠 강의도 들어봤지만 뭔가 빠진 느낌이었어요.
  </p>

  <!-- 전환점 -->
  <div style="padding: 24px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 0 12px 12px 0; margin-bottom: 32px;">
    <p style="font-size: 16px; font-weight: 700; color: #f97316; margin: 0 0 8px;">그때 깨달은 것</p>
    <p style="font-size: 15px; color: #444; margin: 0; line-height: 1.8;">
      전환점이 된 인사이트나 깨달음을 적어주세요. 단순한 팁이 아닌, 관점의 변화가 좋습니다.
    </p>
  </div>

  <!-- 결과 수치 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 20px;">📊 그 결과</p>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 48px;">
    <div style="text-align: center; padding: 24px 16px; background: #f9f9f9; border-radius: 16px;">
      <p style="font-size: 32px; font-weight: 900; color: #f97316; margin: 0 0 4px;">00만</p>
      <p style="font-size: 13px; color: #666; margin: 0;">성과 수치 1</p>
    </div>
    <div style="text-align: center; padding: 24px 16px; background: #f9f9f9; border-radius: 16px;">
      <p style="font-size: 32px; font-weight: 900; color: #f97316; margin: 0 0 4px;">000명</p>
      <p style="font-size: 13px; color: #666; margin: 0;">성과 수치 2</p>
    </div>
    <div style="text-align: center; padding: 24px 16px; background: #f9f9f9; border-radius: 16px;">
      <p style="font-size: 32px; font-weight: 900; color: #f97316; margin: 0 0 4px;">00%</p>
      <p style="font-size: 13px; color: #666; margin: 0;">성과 수치 3</p>
    </div>
  </div>

  <!-- 수강생 후기 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">💬 수강생 후기</p>
  <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px;">
    <div style="padding: 20px 24px; background: #f9f9f9; border-radius: 16px; border: 1px solid #eee;">
      <p style="font-size: 15px; color: #333; margin: 0 0 12px; line-height: 1.8;">
        "수강생 후기 내용을 직접 입력하세요. 구체적인 변화나 성과가 담긴 후기가 좋습니다."
      </p>
      <p style="font-size: 13px; color: #f97316; font-weight: 700; margin: 0;">— 수강생 이름 / 직업</p>
    </div>
    <div style="padding: 20px 24px; background: #f9f9f9; border-radius: 16px; border: 1px solid #eee;">
      <p style="font-size: 15px; color: #333; margin: 0 0 12px; line-height: 1.8;">
        "두 번째 수강생 후기 내용을 입력하세요."
      </p>
      <p style="font-size: 13px; color: #f97316; font-weight: 700; margin: 0;">— 수강생 이름 / 직업</p>
    </div>
  </div>

  <!-- 강의 구성 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">🗂 강의 구성</p>
  <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 48px;">
    <div style="display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: #fff; border: 1px solid #eee; border-radius: 12px;">
      <span style="width: 28px; height: 28px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;">1</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">챕터 1 제목</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: #fff; border: 1px solid #eee; border-radius: 12px;">
      <span style="width: 28px; height: 28px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;">2</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">챕터 2 제목</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: #fff; border: 1px solid #eee; border-radius: 12px;">
      <span style="width: 28px; height: 28px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;">3</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">챕터 3 제목</p>
    </div>
  </div>

  <!-- 마무리 CTA -->
  <div style="text-align: center; padding: 48px 24px; background: #1a1a1a; border-radius: 20px; color: white;">
    <p style="font-size: 13px; color: #f97316; font-weight: 700; letter-spacing: 2px; margin: 0 0 12px;">LIMITED</p>
    <p style="font-size: 24px; font-weight: 800; margin: 0 0 8px;">지금이 가장 좋은 시작점입니다</p>
    <p style="font-size: 15px; color: #aaa; margin: 0;">망설이는 그 시간이 가장 아까운 시간입니다.</p>
  </div>

</div>`,
  },
  {
    id: "impact",
    name: "임팩트형",
    description: "강렬한 수치·비교표·긴급성 강조",
    html: `<div style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; color: #1a1a1a; line-height: 1.8; max-width: 720px;">

  <!-- 긴급 배너 -->
  <div style="background: #f97316; color: white; text-align: center; padding: 14px; border-radius: 12px; margin-bottom: 40px; font-size: 15px; font-weight: 700;">
    ⚡ 얼리버드 특가 마감 임박 — 지금 놓치면 정가로 돌아갑니다
  </div>

  <!-- 임팩트 헤드라인 -->
  <div style="text-align: center; margin-bottom: 48px;">
    <p style="font-size: 13px; color: #f97316; font-weight: 700; letter-spacing: 3px; margin: 0 0 12px;">WHY THIS COURSE</p>
    <p style="font-size: 28px; font-weight: 900; color: #1a1a1a; margin: 0 0 12px; line-height: 1.3;">
      강의 핵심 가치를<br/>한 문장으로 표현하세요
    </p>
    <p style="font-size: 16px; color: #666; margin: 0;">부제목 또는 보조 설명</p>
  </div>

  <!-- 핵심 수치 3개 -->
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; background: #eee; border-radius: 16px; overflow: hidden; margin-bottom: 48px;">
    <div style="text-align: center; padding: 28px 16px; background: white;">
      <p style="font-size: 36px; font-weight: 900; color: #f97316; margin: 0; line-height: 1;">00</p>
      <p style="font-size: 13px; color: #999; margin: 6px 0 0; font-weight: 500;">단위/지표</p>
    </div>
    <div style="text-align: center; padding: 28px 16px; background: white;">
      <p style="font-size: 36px; font-weight: 900; color: #f97316; margin: 0; line-height: 1;">000</p>
      <p style="font-size: 13px; color: #999; margin: 6px 0 0; font-weight: 500;">단위/지표</p>
    </div>
    <div style="text-align: center; padding: 28px 16px; background: white;">
      <p style="font-size: 36px; font-weight: 900; color: #f97316; margin: 0; line-height: 1;">00%</p>
      <p style="font-size: 13px; color: #999; margin: 6px 0 0; font-weight: 500;">단위/지표</p>
    </div>
  </div>

  <!-- 문제 제기 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">😤 이런 상황, 공감되시나요?</p>
  <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 48px;">
    <div style="display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: #fff5f5; border-radius: 12px;">
      <span style="font-size: 18px; flex-shrink: 0;">😮‍💨</span>
      <p style="font-size: 15px; color: #555; margin: 0;">공감 포인트 1 — 수강생의 현실적인 고민</p>
    </div>
    <div style="display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: #fff5f5; border-radius: 12px;">
      <span style="font-size: 18px; flex-shrink: 0;">😮‍💨</span>
      <p style="font-size: 15px; color: #555; margin: 0;">공감 포인트 2 — 수강생의 현실적인 고민</p>
    </div>
    <div style="display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: #fff5f5; border-radius: 12px;">
      <span style="font-size: 18px; flex-shrink: 0;">😮‍💨</span>
      <p style="font-size: 15px; color: #555; margin: 0;">공감 포인트 3 — 수강생의 현실적인 고민</p>
    </div>
  </div>

  <!-- 해결책 -->
  <div style="padding: 32px; background: linear-gradient(135deg, #fff7ed, #fef3c7); border-radius: 20px; margin-bottom: 48px; text-align: center;">
    <p style="font-size: 14px; color: #f97316; font-weight: 700; margin: 0 0 8px;">SOLUTION</p>
    <p style="font-size: 22px; font-weight: 800; color: #1a1a1a; margin: 0 0 12px;">이 강의가 해결해드립니다</p>
    <p style="font-size: 15px; color: #666; margin: 0; line-height: 1.8;">
      강의의 핵심 차별점과 해결책을 간단하게 설명하세요.
    </p>
  </div>

  <!-- 비교표 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">⚖️ 다른 강의와 뭐가 다른가요?</p>
  <div style="border: 1px solid #eee; border-radius: 16px; overflow: hidden; margin-bottom: 48px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #1a1a1a; color: white;">
          <th style="padding: 14px 20px; text-align: left; font-weight: 600;">비교 항목</th>
          <th style="padding: 14px 20px; text-align: center; font-weight: 600; color: #aaa;">일반 강의</th>
          <th style="padding: 14px 20px; text-align: center; font-weight: 700; color: #f97316;">이 강의</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-top: 1px solid #eee;">
          <td style="padding: 14px 20px; color: #444;">비교 항목 1</td>
          <td style="padding: 14px 20px; text-align: center; color: #bbb;">❌</td>
          <td style="padding: 14px 20px; text-align: center; color: #f97316; font-weight: 700;">✅</td>
        </tr>
        <tr style="border-top: 1px solid #eee; background: #fafafa;">
          <td style="padding: 14px 20px; color: #444;">비교 항목 2</td>
          <td style="padding: 14px 20px; text-align: center; color: #bbb;">❌</td>
          <td style="padding: 14px 20px; text-align: center; color: #f97316; font-weight: 700;">✅</td>
        </tr>
        <tr style="border-top: 1px solid #eee;">
          <td style="padding: 14px 20px; color: #444;">비교 항목 3</td>
          <td style="padding: 14px 20px; text-align: center; color: #bbb;">△ 부분적</td>
          <td style="padding: 14px 20px; text-align: center; color: #f97316; font-weight: 700;">✅ 완벽</td>
        </tr>
        <tr style="border-top: 1px solid #eee; background: #fafafa;">
          <td style="padding: 14px 20px; color: #444;">비교 항목 4</td>
          <td style="padding: 14px 20px; text-align: center; color: #bbb;">❌</td>
          <td style="padding: 14px 20px; text-align: center; color: #f97316; font-weight: 700;">✅</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 실제 후기 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">🌟 실제 수강생 이야기</p>
  <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px;">
    <div style="padding: 24px; border: 2px solid #f97316; border-radius: 16px; position: relative;">
      <p style="font-size: 36px; color: #f97316; margin: 0; line-height: 1; position: absolute; top: 12px; left: 20px; opacity: 0.3;">"</p>
      <p style="font-size: 15px; color: #333; margin: 16px 0 16px; line-height: 1.8; padding-left: 8px;">
        구체적인 성과가 담긴 후기를 입력하세요. 숫자로 말할 수 있으면 더 좋습니다.
        예) "수강 2주 만에 팔로워가 300에서 2,000명으로 늘었어요!"
      </p>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 36px; height: 36px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">김</div>
        <div>
          <p style="font-size: 14px; font-weight: 700; margin: 0; color: #1a1a1a;">수강생 이름</p>
          <p style="font-size: 12px; color: #999; margin: 0;">직업 / 상황</p>
        </div>
      </div>
    </div>
    <div style="padding: 24px; border: 1px solid #eee; border-radius: 16px; background: #fafafa;">
      <p style="font-size: 15px; color: #333; margin: 0 0 16px; line-height: 1.8;">
        두 번째 후기 내용을 입력하세요.
      </p>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 36px; height: 36px; background: #ec4899; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">이</div>
        <div>
          <p style="font-size: 14px; font-weight: 700; margin: 0; color: #1a1a1a;">수강생 이름</p>
          <p style="font-size: 12px; color: #999; margin: 0;">직업 / 상황</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 보너스 -->
  <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">🎁 수강 시 제공되는 것들</p>
  <div style="display: grid; gap: 10px; margin-bottom: 48px;">
    <div style="display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #f9f9f9; border-radius: 12px;">
      <span style="font-size: 20px;">📹</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">제공 항목 1</p>
      <span style="margin-left: auto; font-size: 12px; background: #f97316; color: white; padding: 2px 10px; border-radius: 20px; font-weight: 700;">포함</span>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #f9f9f9; border-radius: 12px;">
      <span style="font-size: 20px;">📋</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">제공 항목 2</p>
      <span style="margin-left: auto; font-size: 12px; background: #f97316; color: white; padding: 2px 10px; border-radius: 20px; font-weight: 700;">포함</span>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #f9f9f9; border-radius: 12px;">
      <span style="font-size: 20px;">💬</span>
      <p style="font-size: 15px; color: #333; margin: 0; font-weight: 600;">제공 항목 3</p>
      <span style="margin-left: auto; font-size: 12px; background: #f97316; color: white; padding: 2px 10px; border-radius: 20px; font-weight: 700;">포함</span>
    </div>
  </div>

  <!-- 최종 CTA -->
  <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 48px 32px; border-radius: 24px; text-align: center; color: white;">
    <p style="font-size: 13px; font-weight: 700; letter-spacing: 3px; margin: 0 0 12px; opacity: 0.85;">LAST CHANCE</p>
    <p style="font-size: 26px; font-weight: 900; margin: 0 0 8px; line-height: 1.3;">
      오늘이 가장 저렴한 날입니다
    </p>
    <p style="font-size: 15px; opacity: 0.9; margin: 0 0 0;">
      내일의 나를 바꾸는 결정, 지금 하세요.
    </p>
  </div>

</div>`,
  },
];
