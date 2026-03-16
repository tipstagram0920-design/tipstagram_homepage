import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// CSV 파싱: 따옴표 처리 포함
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] || "").trim()]));
  });
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "CSV 파일을 업로드하세요." }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV 데이터가 없습니다." }, { status: 400 });
  }

  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const row of rows) {
    const email = row["email"]?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push(`유효하지 않은 이메일: ${email || "(비어 있음)"}`);
      results.skipped++;
      continue;
    }

    // 이미 존재하는 이메일 체크
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }).catch(() => null);

    if (existing) {
      results.skipped++;
      continue;
    }

    try {
      const name = row["name"] || null;
      const rawPassword = row["password"];
      const password = rawPassword ? await bcrypt.hash(rawPassword, 12) : null;

      // tags: "VIP,수강생" -> ["VIP", "수강생"]
      const tags = row["tags"]
        ? row["tags"].split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await prisma.user.create({
        data: { email, name, password, tags, role: "USER" },
      });
      results.created++;
    } catch {
      results.errors.push(`생성 실패: ${email}`);
      results.skipped++;
    }
  }

  return NextResponse.json({
    total: rows.length,
    created: results.created,
    skipped: results.skipped,
    errors: results.errors,
  });
}
