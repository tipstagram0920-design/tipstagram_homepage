/**
 * 글로 쓴 메일 본문을 발송용 HTML 로 바꾼다.
 *
 * 어드민에서 드래그앤드롭 에디터로 만든 문안은 내용이 화면에 안 보여서 고치기 어렵다.
 * 그래서 구매 안내처럼 자주 손대는 문안은 "보이는 그대로의 글"로 쓰고, 저장할 때 여기서 감싼다.
 *
 * 쓰는 규칙 (전부 선택):
 *   # 제목          → 큰 제목
 *   - 항목          → 목록 한 줄
 *   [버튼]텍스트|주소 → 버튼
 *   빈 줄           → 문단 구분
 *   http… 주소       → 자동으로 링크
 */

const BRAND = "#833AB4";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 본문 안의 주소를 클릭 가능한 링크로 (치환 변수 {{...}} 는 건드리지 않는다) */
function linkify(s: string): string {
  return s.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" style="color:${BRAND};text-decoration:underline;word-break:break-all;">$1</a>`
  );
}

function inline(s: string): string {
  return linkify(escapeHtml(s));
}

/** 글 → 본문 HTML 조각 */
export function bodyTextToHtml(text: string): string {
  const blocks = (text ?? "")
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    // 버튼만 있는 블록
    if (lines.every((l) => l.startsWith("[버튼]"))) {
      for (const l of lines) {
        const rest = l.slice("[버튼]".length);
        const [label, href] = rest.split("|").map((x) => (x ?? "").trim());
        if (!label || !href) continue;
        out.push(
          `<p style="margin:0 0 12px;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 26px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">${escapeHtml(label)}</a></p>`
        );
      }
      continue;
    }

    // 목록
    if (lines.every((l) => l.startsWith("- "))) {
      const items = lines
        .map(
          (l) =>
            `<li style="margin:0 0 6px;color:#333;font-size:15px;line-height:1.7;">${inline(l.slice(2))}</li>`
        )
        .join("");
      out.push(`<ul style="margin:0 0 16px;padding-left:20px;">${items}</ul>`);
      continue;
    }

    // 제목
    if (lines.length === 1 && lines[0].startsWith("# ")) {
      out.push(
        `<p style="margin:0 0 16px;color:#111;font-size:21px;font-weight:800;line-height:1.45;">${inline(lines[0].slice(2))}</p>`
      );
      continue;
    }

    // 일반 문단 (한 줄 바꿈은 <br>)
    out.push(
      `<p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.75;">${lines.map(inline).join("<br>")}</p>`
    );
  }

  return out.join("");
}

/** 본문 조각을 브랜드 틀에 넣어 완성된 메일 HTML 로 */
export function wrapEmailHtml(inner: string): string {
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
<tr><td style="padding:28px 32px;background:${BRAND};">
<p style="margin:0;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:2px;">TIPSTAGRAM</p>
</td></tr>
<tr><td style="padding:32px;">${inner}</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;">
<p style="margin:0;color:#999;font-size:12px;line-height:1.7;">문의는 이 메일에 그대로 답장해 주세요.<br>팁스타그램</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

/** 글 → 완성된 발송용 메일 HTML */
export function renderEmailFromText(text: string): string {
  return wrapEmailHtml(bodyTextToHtml(text));
}
