#!/bin/bash
# 팁스타그램 수익화 스튜디오 — Mac 설치 (이 파일은 사이트에서 내려받아 실행된다)
SITE_URL="https://tipstagram-homepage.vercel.app"
NODE_VER="v24.22.0"
DEST="$HOME/Documents/tipstagram-studio"
ZIP_URL="$SITE_URL/studio/tipstagram-studio.zip"
TMP="$(mktemp -d /tmp/tipstagram-install.XXXXXX)"

say()  { printf "\n\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "  ✓ %s\n" "$1"; }
fail() { printf "\n❌ %s\n   → %s\n\n" "$1" "$2"; printf "이 창의 내용을 그대로 캡처해서 보내주시면 도와드릴게요.\n"; read -r -p "엔터를 누르면 창이 닫혀요 " _; exit 1; }
step=0; total=7
title() { step=$((step+1)); say "[$step/$total] $1"; }

printf "\n팁스타그램 수익화 스튜디오 설치를 시작해요. 3~6분 걸려요.\n컴퓨터: Mac ($(uname -m)), 사용자: $(whoami)\n"

# 1. 폴더
title "설치 폴더 준비"
mkdir -p "$DEST" || fail "폴더를 만들지 못했어요." "문서 폴더에 쓰기 권한이 있는지 확인해 주세요."
MODE="새 설치"; [ -f "$DEST/package.json" ] && MODE="업데이트 (내 설정·결과물은 그대로 둬요)"
ok "$DEST ($MODE)"

# 2. Node (앱 폴더 안에, 컴퓨터에 설치하지 않음)
title "실행 엔진(Node) 준비"
ARCH="darwin-x64"; [ "$(uname -m)" = "arm64" ] && ARCH="darwin-arm64"
NODE="$DEST/runtime/node/bin/node"
if [ -x "$NODE" ] && [ "$("$NODE" -v 2>/dev/null)" = "$NODE_VER" ]; then ok "이미 있어요 ($NODE_VER)"; else
  curl -fL --progress-bar "https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-$ARCH.tar.gz" -o "$TMP/node.tgz" || fail "실행 엔진을 내려받지 못했어요." "인터넷 연결을 확인하고 다시 실행해 주세요."
  mkdir -p "$DEST/runtime" && rm -rf "$DEST/runtime/node" && tar -xzf "$TMP/node.tgz" -C "$TMP" && mv "$TMP/node-$NODE_VER-$ARCH" "$DEST/runtime/node" || fail "실행 엔진을 풀지 못했어요." "디스크 여유 공간(300MB 이상)을 확인해 주세요."
  ok "준비됨 ($NODE_VER)"
fi
export PATH="$DEST/runtime/node/bin:$HOME/.local/bin:$PATH"

# 3. 앱 파일
title "앱 파일 내려받기"
curl -fL --progress-bar "$ZIP_URL" -o "$TMP/app.zip" || fail "앱 파일을 내려받지 못했어요." "인터넷 연결을 확인하고 다시 실행해 주세요. ($ZIP_URL)"
NEW_VER="$(unzip -p "$TMP/app.zip" tipstagram-studio/VERSION 2>/dev/null | tr -d '[:space:]')"
OLD_VER="$(cat "$DEST/VERSION" 2>/dev/null | tr -d '[:space:]')"
if [ -n "$NEW_VER" ] && [ "$NEW_VER" = "$OLD_VER" ] && [ -d "$DEST/node_modules" ]; then ok "이미 최신이에요 ($OLD_VER)"; SKIP_BUILD=1; else
  unzip -q -o "$TMP/app.zip" -d "$TMP/unz" || fail "앱 파일을 풀지 못했어요." "다시 실행해 주세요."
  rsync -a --delete --exclude data --exclude output --exclude node_modules --exclude .next --exclude runtime --exclude 'prompts/custom' --exclude 'presets/custom' "$TMP/unz/tipstagram-studio/" "$DEST/" || fail "앱 파일을 복사하지 못했어요." "다시 실행해 주세요."
  ok "앱 ${NEW_VER:-?} 준비됨"
fi

# 4. Claude Code
title "클로드(Claude Code) 확인"
if command -v claude >/dev/null 2>&1; then ok "이미 있어요 ($(claude --version 2>/dev/null | head -1))"; else
  printf "  클로드를 설치해요 (1분)…\n"
  curl -fsSL https://claude.ai/install.sh | bash >/dev/null 2>&1 || fail "클로드를 설치하지 못했어요." "https://claude.com/claude-code 에서 직접 설치한 뒤 다시 실행해 주세요."
  export PATH="$HOME/.local/bin:$PATH"
  command -v claude >/dev/null 2>&1 || fail "클로드 설치 뒤에도 명령을 찾지 못했어요." "터미널을 새로 열고 이 파일을 다시 실행해 주세요."
  ok "설치됨"
fi

# 5. 앱 설치(의존성·브라우저·빌드·바탕화면 아이콘)
title "앱 설치 (가장 오래 걸려요, 2~4분)"
cd "$DEST" || fail "앱 폴더로 이동하지 못했어요." "$DEST"
if [ -n "${SKIP_BUILD:-}" ] && [ -f "$DEST/.next/BUILD_ID" ]; then
  "$NODE" scripts/install.mjs --skip-install --skip-build || fail "앱 설치 확인에 실패했어요." "위 메시지를 캡처해서 보내주세요."
else
  "$NODE" scripts/install.mjs || fail "앱 설치에 실패했어요." "위 메시지를 캡처해서 보내주세요."
fi

# 6. 클로드 로그인
title "클로드 로그인 확인"
check_login() { ( echo "ok" | claude -p --model sonnet --output-format text >/dev/null 2>&1 ) & local pid=$!; local i=0; while kill -0 $pid 2>/dev/null && [ $i -lt 40 ]; do sleep 1; i=$((i+1)); done; if kill -0 $pid 2>/dev/null; then kill $pid 2>/dev/null; return 1; fi; wait $pid; }
if check_login; then ok "로그인돼 있어요"; else
  printf "\n  클로드에 로그인이 필요해요. 잠시 뒤 브라우저가 열리면 로그인하고,\n  이 창에 클로드 화면이 뜨면 아무 글자나 치지 말고 Ctrl+C 를 두 번 눌러 나오세요.\n\n"
  read -r -p "  준비되면 엔터 " _
  claude || true
  if check_login; then ok "로그인됐어요"; else fail "아직 로그인이 안 됐어요." "터미널에서 claude 를 실행해 로그인한 뒤 이 파일을 다시 실행해 주세요."; fi
fi

# 7. 실행
title "스튜디오 켜기"
printf "\n🎉 설치가 끝났어요!\n  · 다음부터는 바탕화면의 \"팁스타그램 스튜디오\" 아이콘을 누르세요.\n  · 릴스(그림·목소리)를 쓰려면 화면의 설정에서 Gemini 를 연결하세요.\n  · 이 창은 스튜디오가 켜져 있는 동안 열어 두세요.\n\n"
"$NODE" scripts/start.mjs
