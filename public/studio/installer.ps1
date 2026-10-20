# 팁스타그램 수익화 스튜디오 — Windows 설치 (사이트에서 내려받아 실행)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$SITE_URL = "https://tipstagram-homepage.vercel.app"
$NODE_VER = "v24.22.0"
$DEST = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "tipstagram-studio"
$ZIP_URL = "$SITE_URL/studio/tipstagram-studio.zip"
$TMP = Join-Path $env:TEMP ("tipstagram-install-" + [guid]::NewGuid().ToString("N").Substring(0,8))
New-Item -ItemType Directory -Force -Path $TMP | Out-Null
$step = 0; $total = 7
function Title($t) { $script:step++; Write-Host "`n[$script:step/$total] $t" -ForegroundColor White }
function Ok($t) { Write-Host "  ✓ $t" }
function Fail($msg, $hint) { Write-Host "`n❌ $msg" -ForegroundColor Red; Write-Host "   → $hint"; Write-Host "`n이 창의 내용을 그대로 캡처해서 보내주시면 도와드릴게요."; Read-Host "엔터를 누르면 창이 닫혀요" | Out-Null; exit 1 }

Write-Host "`n팁스타그램 수익화 스튜디오 설치를 시작해요. 3~6분 걸려요."
Write-Host "컴퓨터: Windows ($env:PROCESSOR_ARCHITECTURE), 사용자: $env:USERNAME"

Title "설치 폴더 준비"
try { New-Item -ItemType Directory -Force -Path $DEST | Out-Null } catch { Fail "폴더를 만들지 못했어요." "문서 폴더에 쓰기 권한이 있는지 확인해 주세요." }
$mode = if (Test-Path (Join-Path $DEST "package.json")) { "업데이트 (내 설정·결과물은 그대로 둬요)" } else { "새 설치" }
Ok "$DEST ($mode)"

Title "실행 엔진(Node) 준비"
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "win-arm64" } else { "win-x64" }
$NODE = Join-Path $DEST "runtime\node\node.exe"
$have = (Test-Path $NODE) -and ((& $NODE -v 2>$null) -eq $NODE_VER)
if ($have) { Ok "이미 있어요 ($NODE_VER)" } else {
  try {
    Invoke-WebRequest "https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-$arch.zip" -OutFile (Join-Path $TMP "node.zip") -UseBasicParsing
    Expand-Archive (Join-Path $TMP "node.zip") -DestinationPath $TMP -Force
    New-Item -ItemType Directory -Force -Path (Join-Path $DEST "runtime") | Out-Null
    if (Test-Path (Join-Path $DEST "runtime\node")) { Remove-Item (Join-Path $DEST "runtime\node") -Recurse -Force }
    Move-Item (Join-Path $TMP "node-$NODE_VER-$arch") (Join-Path $DEST "runtime\node")
  } catch { Fail "실행 엔진을 내려받지 못했어요." "인터넷 연결을 확인하고 다시 실행해 주세요." }
  Ok "준비됨 ($NODE_VER)"
}
$env:PATH = (Join-Path $DEST "runtime\node") + ";" + (Join-Path $env:USERPROFILE ".local\bin") + ";" + $env:PATH

Title "앱 파일 내려받기"
try { Invoke-WebRequest $ZIP_URL -OutFile (Join-Path $TMP "app.zip") -UseBasicParsing } catch { Fail "앱 파일을 내려받지 못했어요." "인터넷 연결을 확인하고 다시 실행해 주세요. ($ZIP_URL)" }
$unz = Join-Path $TMP "unz"
try { Expand-Archive (Join-Path $TMP "app.zip") -DestinationPath $unz -Force } catch { Fail "앱 파일을 풀지 못했어요." "다시 실행해 주세요." }
$src = Join-Path $unz "tipstagram-studio"
$newVer = (Get-Content (Join-Path $src "VERSION") -ErrorAction SilentlyContinue | Out-String).Trim()
$oldVer = (Get-Content (Join-Path $DEST "VERSION") -ErrorAction SilentlyContinue | Out-String).Trim()
$skipBuild = $false
if ($newVer -and ($newVer -eq $oldVer) -and (Test-Path (Join-Path $DEST "node_modules"))) { Ok "이미 최신이에요 ($oldVer)"; $skipBuild = $true } else {
  $r = robocopy $src $DEST /E /PURGE /XD data output node_modules .next runtime "prompts\custom" "presets\custom" /NFL /NDL /NJH /NJS /NP
  if ($LASTEXITCODE -ge 8) { Fail "앱 파일을 복사하지 못했어요." "다시 실행해 주세요." }
  Ok "앱 $newVer 준비됨"
}

Title "클로드(Claude Code) 확인"
$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($claude) { Ok "이미 있어요" } else {
  Write-Host "  클로드를 설치해요 (1분)…"
  try { Invoke-Expression (Invoke-RestMethod https://claude.ai/install.ps1) | Out-Null } catch { Fail "클로드를 설치하지 못했어요." "https://claude.com/claude-code 에서 직접 설치한 뒤 다시 실행해 주세요." }
  $env:PATH = (Join-Path $env:USERPROFILE ".local\bin") + ";" + $env:PATH
  if (-not (Get-Command claude -ErrorAction SilentlyContinue)) { Fail "클로드 설치 뒤에도 명령을 찾지 못했어요." "창을 닫고 이 파일을 다시 실행해 주세요." }
  Ok "설치됨"
}

Title "앱 설치 (가장 오래 걸려요, 2~4분)"
Set-Location $DEST
$args = @("scripts/install.mjs"); if ($skipBuild -and (Test-Path (Join-Path $DEST ".next\BUILD_ID"))) { $args += "--skip-install"; $args += "--skip-build" }
& $NODE @args
if ($LASTEXITCODE -ne 0) { Fail "앱 설치에 실패했어요." "위 메시지를 캡처해서 보내주세요." }

Title "클로드 로그인 확인"
function Check-Login {
  $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "echo ok | claude -p --model sonnet --output-format text >nul 2>&1" -PassThru -WindowStyle Hidden
  if ($p.WaitForExit(40000)) { return ($p.ExitCode -eq 0) } else { try { $p.Kill() } catch {}; return $false }
}
if (Check-Login) { Ok "로그인돼 있어요" } else {
  Write-Host "`n  클로드에 로그인이 필요해요. 잠시 뒤 브라우저가 열리면 로그인하고,"
  Write-Host "  이 창에 클로드 화면이 뜨면 Ctrl+C 를 두 번 눌러 나오세요.`n"
  Read-Host "  준비되면 엔터" | Out-Null
  & claude
  if (Check-Login) { Ok "로그인됐어요" } else { Fail "아직 로그인이 안 됐어요." "명령 창에서 claude 를 실행해 로그인한 뒤 이 파일을 다시 실행해 주세요." }
}

Title "스튜디오 켜기"
Write-Host "`n🎉 설치가 끝났어요!"
Write-Host "  · 다음부터는 바탕화면의 '팁스타그램 스튜디오' 아이콘을 누르세요."
Write-Host "  · 릴스(그림·목소리)를 쓰려면 화면의 설정에서 Gemini 를 연결하세요."
Write-Host "  · 이 창은 스튜디오가 켜져 있는 동안 열어 두세요.`n"
& $NODE scripts/start.mjs
