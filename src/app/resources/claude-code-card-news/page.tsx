import Link from "next/link";
import { ResourceLayout, ResourceCard } from "../ResourceLayout";
import { CodeBlock, Note } from "./_components/CodeBlock";

export const dynamic = "force-static";

export const metadata = {
  title: "4주차 · VS Code에서 Claude Code로 내 일 자동화하기",
  description:
    "컴퓨터를 하나도 몰라도 따라 할 수 있게, VS Code에서 Claude Code를 켜는 것부터 기획 · 규칙 · 스킬 · 에이전트까지 순서대로 정리한 4주차 다시보기 자료입니다.",
};

/** 본문 안에서 파일 경로·버튼 이름·단축키를 표시할 때 쓰는 작은 배지 */
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[13px] font-semibold text-neutral-800">
      {children}
    </code>
  );
}

function StepList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-black text-white">
            {i + 1}
          </span>
          <div className="flex-1 space-y-2 pt-0.5">{item}</div>
        </li>
      ))}
    </ol>
  );
}

/** 프로젝트 3종을 나란히 보여주는 예시 카드 */
function ExampleGrid({
  rows,
}: {
  rows: { project: string; body: React.ReactNode }[];
}) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.project} className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-pink-600">
            {r.project}
          </p>
          <div className="mt-1.5 space-y-1 text-[13.5px] leading-6 text-neutral-700">{r.body}</div>
        </div>
      ))}
    </div>
  );
}

export default function ClaudeCodeCardNewsPage() {
  return (
    <ResourceLayout
      eyebrow="4주차 다시보기"
      title="VS Code에서 Claude Code로 내 일 자동화하기"
      subtitle="컴퓨터를 한 번도 만져본 적 없어도 따라 할 수 있게, 화면 켜는 것부터 기획 · 규칙 · 스킬 · 에이전트까지 순서대로 정리했습니다. 카드뉴스는 예시일 뿐, 어떤 프로젝트에도 그대로 적용되는 순서입니다."
    >
      {/* ─────────────────────────── 0. 전체 그림 ─────────────────────────── */}
      <ResourceCard index="0" title="이 수업에서 진짜로 배우는 것">
        <p>
          이번 주에 배우는 건 <strong>&ldquo;내가 매번 손으로 하던 일을, 컴퓨터가 대신하게 만드는 순서&rdquo;</strong>입니다.
          카드뉴스든, 고객 문의 답변이든, 매주 보고서든 <strong>순서는 똑같습니다.</strong>
        </p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-[13px] font-bold text-neutral-900">이 순서 하나만 기억하세요</p>
          <p className="mt-3 text-[14px] font-black leading-7 text-neutral-800">
            기획 → 규칙 → 스킬 → 에이전트 → 실행 → 다듬기
          </p>
          <p className="mt-2 text-[13px] leading-6 text-neutral-500">
            대부분은 <strong className="text-neutral-700">기획을 건너뛰고 규칙부터</strong> 씁니다. 그래서 만들다가
            &ldquo;어? 내가 뭘 만들고 있었지?&rdquo;가 됩니다. 오늘은 기획을 <strong>Step 0</strong>으로 따로 뺐습니다.
          </p>
        </div>

        <p className="pt-1 text-[14px] font-bold text-neutral-900">이 순서로 만들 수 있는 것들</p>
        <ExampleGrid
          rows={[
            {
              project: "예시 A · 인스타 카드뉴스",
              body: <p>주제만 정해두면 매주 카드뉴스 초안이 알아서 만들어지는 구조. (제가 실제로 돌리고 있는 것)</p>,
            },
            {
              project: "예시 B · 고객 문의 답변",
              body: <p>자주 오는 질문과 내 답변 말투를 정리해두면, 새 문의가 오면 답변 초안이 나오는 구조.</p>,
            },
            {
              project: "예시 C · 영상 → 블로그 글",
              body: <p>유튜브 영상 자막을 넣으면 내 블로그 형식에 맞는 글로 바꿔주는 구조.</p>,
            },
          ]}
        />
        <p className="text-[13px] text-neutral-500">
          아래 설명은 <strong>예시 A(카드뉴스)</strong>를 끝까지 따라가며 보여줍니다. 본인 프로젝트 이름만 바꿔 넣으면 그대로 됩니다.
        </p>
      </ResourceCard>

      {/* ─────────────────────────── 1. 용어 3개 ─────────────────────────── */}
      <ResourceCard index="1" title="딱 3개 용어만 알면 됩니다 — 규칙 · 스킬 · 에이전트">
        <p>
          이 셋은 이름만 어렵지, <strong>식당을 떠올리면 5초 만에 이해됩니다.</strong>
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[13px] font-black text-neutral-900">규칙 (Rules) = 매장 운영 매뉴얼</p>
            <p className="mt-1.5 text-[13.5px] leading-6 text-neutral-600">
              &ldquo;우리 가게는 이렇게 한다&rdquo;를 적어둔 문서. 모든 직원이 <strong>항상</strong> 봅니다.
              파일 이름은 <Mono>CLAUDE.md</Mono> 하나뿐이고, 프로젝트 폴더 맨 위에 둡니다.
            </p>
            <p className="mt-1.5 text-[13px] text-neutral-500">
              예: &ldquo;말투는 반말 금지&rdquo;, &ldquo;결과물은 항상 output 폴더에 저장&rdquo;, &ldquo;과장 표현 금지&rdquo;
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[13px] font-black text-neutral-900">스킬 (Skills) = 레시피 카드</p>
            <p className="mt-1.5 text-[13.5px] leading-6 text-neutral-600">
              &ldquo;김치찌개 만드는 법&rdquo;처럼 <strong>특정 작업 하나</strong>의 순서를 적어둔 문서.
              필요할 때만 꺼내 봅니다.
            </p>
            <p className="mt-1.5 text-[13px] text-neutral-500">
              예: &ldquo;카드뉴스 초안 쓰기&rdquo;, &ldquo;문의 답변 초안 쓰기&rdquo;, &ldquo;자막을 블로그 글로 바꾸기&rdquo;
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[13px] font-black text-neutral-900">에이전트 (Agents) = 직원</p>
            <p className="mt-1.5 text-[13.5px] leading-6 text-neutral-600">
              레시피를 들고 <strong>실제로 일하는 사람</strong>입니다. 쓰는 사람, 검수하는 사람으로 역할을 나눠두면
              서로 섞이지 않고 각자 자기 일만 깔끔하게 합니다.
            </p>
            <p className="mt-1.5 text-[13px] text-neutral-500">
              예: 초안 작성 담당, 규칙 위반 검수 담당, 사실 확인 담당
            </p>
          </div>
        </div>

        <Note title="헷갈릴 때 이 한 줄만 기억하세요">
          <p>규칙은 &ldquo;항상&rdquo;, 스킬은 &ldquo;이 작업할 때&rdquo;, 에이전트는 &ldquo;이 사람이&rdquo;.</p>
          <p>
            그리고 이 셋을 만들기 <strong>전에</strong> 반드시 하는 게 <strong>Step 0 기획</strong>입니다.
            무엇을 만들지 모르는 채로 매뉴얼부터 쓸 수는 없으니까요.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 2. 준비물 (VS Code) ─────────────────────────── */}
      <ResourceCard index="2" title="준비물 — VS Code에 Claude를 붙입니다 (20분)">
        <p>
          터미널(검은 화면)을 쓸 필요 없습니다. <strong>VS Code라는 프로그램 안에 Claude를 붙여서</strong>
          채팅하듯 쓰는 방식으로 갑니다.
        </p>

        <StepList
          items={[
            <>
              <p className="text-[14px] font-bold text-neutral-900">VS Code 설치하기</p>
              <p>
                <strong>code.visualstudio.com</strong>에 들어가 파란 버튼을 눌러 받고, 계속 &ldquo;다음&rdquo;만 누르면 설치됩니다.
              </p>
              <p className="text-[13px] text-neutral-500">
                이미 깔려 있다면 <Mono>도움말 → VS Code 정보</Mono>에서 버전이 <strong>1.94</strong> 이상인지만 확인하세요.
              </p>
            </>,
            <>
              <p className="text-[14px] font-bold text-neutral-900">Claude Code 확장 설치하기</p>
              <p>
                VS Code를 켜고 <Mono>Cmd + Shift + X</Mono>(맥) 또는 <Mono>Ctrl + Shift + X</Mono>(윈도우)를 누르면
                왼쪽에 검색창이 열립니다. 거기에 <strong>Claude Code</strong>라고 치고 <strong>Install</strong> 버튼을 누르세요.
              </p>
              <p className="text-[13px] text-neutral-500">
                설치 후에도 안 보이면 VS Code를 껐다 켜면 됩니다.
              </p>
            </>,
            <>
              <p className="text-[14px] font-bold text-neutral-900">로그인하기</p>
              <p>
                Claude 창을 처음 열면 로그인 화면이 뜹니다. <strong>Sign in</strong>을 누르고 브라우저에서 승인하면 끝입니다.
              </p>
              <p className="text-[13px] text-neutral-500">
                평소 쓰시는 Claude 유료 계정(Pro / Max 등)이면 됩니다. <strong>API 키 같은 건 필요 없습니다.</strong>
              </p>
            </>,
          ]}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">Claude 창을 여는 4가지 방법</p>
        <p>어느 것으로 열어도 똑같습니다. 편한 걸 쓰세요.</p>
        <div className="space-y-2">
          {[
            ["편집기 오른쪽 위의 ✱ 아이콘", "파일을 하나 열어둔 상태에서만 보입니다. 가장 빠릅니다."],
            ["왼쪽 세로 막대의 ✱ 아이콘", "항상 보입니다. 지난 대화 목록이 함께 열립니다."],
            ["오른쪽 아래 ✱ Claude Code 글자", "파일을 안 열어도 됩니다."],
            ["Cmd/Ctrl + Shift + P → \"Claude Code\" 입력", "명령 검색창에서 찾는 방법."],
          ].map(([a, b], i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-[13.5px] font-bold text-neutral-900">{a}</p>
              <p className="mt-0.5 text-[13px] text-neutral-500">{b}</p>
            </div>
          ))}
        </div>

        <p className="pt-2 text-[14px] font-bold text-neutral-900">외워두면 편한 단축키</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 pr-3 font-bold">하는 일</th>
                <th className="py-2 pr-3 font-bold">맥</th>
                <th className="py-2 font-bold">윈도우</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700">
              {[
                ["코드 화면 ↔ Claude 창 왔다갔다", "Cmd + Esc", "Ctrl + Esc"],
                ["Claude 대화를 새 탭으로 열기", "Cmd + Shift + Esc", "Ctrl + Shift + Esc"],
                ["지금 보는 파일·선택 부분을 Claude에게 넘기기", "Option + K", "Alt + K"],
                ["줄바꿈 (보내지 않고 다음 줄)", "Shift + Enter", "Shift + Enter"],
              ].map(([a, b, c], i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-2.5 pr-3">{a}</td>
                  <td className="py-2.5 pr-3 font-mono text-[12px] font-semibold">{b}</td>
                  <td className="py-2.5 font-mono text-[12px] font-semibold">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Note title="맥에서 Cmd + Esc가 안 먹힐 때">
          <p>
            최신 맥에서는 이 단축키를 게임 오버레이가 가로챕니다.
            <Mono>시스템 설정 → 키보드 → 키보드 단축키 → 게임 컨트롤러</Mono>에서
            <strong> 게임 오버레이</strong> 체크를 끄면 됩니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 3. Step 0 기획 ─────────────────────────── */}
      <ResourceCard index="3" title="Step 0 — 만들기 전에 먼저: 작동 원리와 사용자 여정 (가장 중요)">
        <p>
          여기가 <strong>오늘 수업에서 제일 중요한 부분</strong>입니다.
          규칙도 스킬도 에이전트도, <strong>&ldquo;이게 뭘 하는 물건인지&rdquo;가 정해져야 쓸 수 있습니다.</strong>
        </p>
        <p>
          이 단계를 건너뛰면 어떻게 되냐면 — Claude가 열심히 만들어는 주는데, 만들고 보니 내가 원한 게 아닙니다.
          그리고 그때는 이미 코드가 잔뜩 쌓여 있어서 되돌리기가 훨씬 어렵습니다.
          <strong> 종이 한 장 분량의 기획이 하루치 작업을 아낍니다.</strong>
        </p>

        {/* 0-1 */}
        <p className="pt-2 text-[14px] font-bold text-neutral-900">0-1. 한 문장으로 정의하기</p>
        <p>
          &ldquo;<strong>누가</strong>, <strong>무엇을 넣으면</strong>, <strong>무엇을 받는다</strong>&rdquo; — 이 틀에 맞춰 한 문장을 쓰세요.
        </p>
        <ExampleGrid
          rows={[
            {
              project: "예시 A · 카드뉴스",
              body: <p>&ldquo;내가 주제 하나를 넣으면, 인스타에 바로 올릴 수 있는 카드 10장 초안을 받는다.&rdquo;</p>,
            },
            {
              project: "예시 B · 문의 답변",
              body: <p>&ldquo;고객 문의 글을 붙여넣으면, 내 말투로 쓴 답변 초안 3가지를 받는다.&rdquo;</p>,
            },
            {
              project: "예시 C · 영상 → 블로그",
              body: <p>&ldquo;유튜브 자막을 넣으면, 내 블로그 형식에 맞춘 글 한 편을 받는다.&rdquo;</p>,
            },
          ]}
        />
        <p className="text-[13px] text-neutral-500">
          한 문장으로 안 써지면, 아직 만들 준비가 안 된 겁니다. <strong>범위를 더 좁히세요.</strong>
        </p>

        {/* 0-2 */}
        <p className="pt-3 text-[14px] font-bold text-neutral-900">0-2. 사용자 여정 그리기</p>
        <p>
          <strong>사용자 여정</strong>은 &ldquo;쓰는 사람이 처음부터 끝까지 겪는 순서&rdquo;입니다.
          어렵게 생각하지 말고, <strong>내가 이걸 쓰는 장면을 그대로 적으면</strong> 됩니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 pr-3 font-bold">단계</th>
                <th className="py-2 pr-3 font-bold">사용자가 하는 일</th>
                <th className="py-2 font-bold">그때 필요한 것</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700">
              {[
                ["1. 시작", "일요일 밤, 이번 주 올릴 게 없다는 걸 깨달음", "주제 후보 목록"],
                ["2. 입력", "주제 하나를 고르고 Claude에게 말함", "고르기 쉬운 주제 목록"],
                ["3. 기다림", "10장 초안이 나오는 걸 봄", "진행 상황이 보일 것"],
                ["4. 검토", "마음에 안 드는 장을 고쳐달라고 함", "장 단위로 고칠 수 있을 것"],
                ["5. 마무리", "완성본을 저장하고 인스타에 올림", "이미지·글이 한 폴더에 정리될 것"],
              ].map((r, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-2.5 pr-3 font-semibold text-neutral-900">{r[0]}</td>
                  <td className="py-2.5 pr-3">{r[1]}</td>
                  <td className="py-2.5 text-neutral-500">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-neutral-500">
          오른쪽 칸(&ldquo;그때 필요한 것&rdquo;)이 <strong>나중에 그대로 만들 기능 목록</strong>이 됩니다.
          여기서 &ldquo;주제 후보 목록&rdquo;이 나왔기 때문에, 뒤에서 주제 은행을 만드는 겁니다.
        </p>

        {/* 0-3 */}
        <p className="pt-3 text-[14px] font-bold text-neutral-900">0-3. 작동 원리 그리기 (입력 → 처리 → 출력)</p>
        <p>
          이번엔 <strong>안에서 무슨 일이 일어나는지</strong>를 단계로 쪼갭니다.
          &ldquo;한 번에 짠 하고 나온다&rdquo;가 아니라, <strong>몇 단계를 거쳐서 나오는지</strong>를 적는 게 핵심입니다.
        </p>
        <CodeBlock
          label="예시 A · 카드뉴스의 작동 원리"
          code={`[입력]  주제 한 줄

  ↓ 1단계 · 근거 모으기
        웹에서 그 주제의 실제 사례·숫자를 찾는다

  ↓ 2단계 · 글쓰기
        모은 근거로 표지 1장 + 본문 8장 + 마지막 1장을 쓴다

  ↓ 3단계 · 검수
        글자 수와 말투 규칙을 어긴 곳을 찾아 고친다

  ↓ 4단계 · 이미지로 굽기
        글을 1080x1350 이미지 10장으로 만든다

[출력]  output 폴더에 이미지 10장 + 원본 글`}
        />
        <p className="text-[13px] text-neutral-500">
          이렇게 쪼개두면 나중에 <strong>단계 하나 = 스킬 하나 또는 에이전트 하나</strong>로 그대로 연결됩니다.
          기획이 곧 설계도가 되는 겁니다.
        </p>

        {/* 0-4 */}
        <p className="pt-3 text-[14px] font-bold text-neutral-900">0-4. 이 세 가지를 파일로 남기기</p>
        <p>
          머릿속에만 있으면 소용없습니다. <Mono>PLAN.md</Mono>라는 파일 하나로 남기세요.
          이 파일이 <strong>앞으로 모든 규칙·스킬·에이전트의 출처</strong>가 됩니다.
        </p>
        <CodeBlock
          label="파일: PLAN.md"
          code={`# 이 프로젝트는 무엇인가

## 한 문장
내가 주제 하나를 넣으면, 인스타에 바로 올릴 수 있는 카드 10장 초안을 받는다.

## 누가 쓰나
- 나 혼자. 매주 일요일 밤에 한 번.
- 컴퓨터를 잘 모르는 상태로도 쓸 수 있어야 한다.

## 사용자 여정
1. 이번 주 올릴 게 없다는 걸 깨닫는다
2. 주제 목록에서 하나를 고른다
3. 초안 10장이 나오는 걸 기다린다
4. 마음에 안 드는 장을 골라 고쳐달라고 한다
5. 완성본을 저장하고 인스타에 올린다

## 작동 원리
주제 → 근거 모으기 → 글쓰기 → 검수 → 이미지 굽기 → 저장

## 이번에 만들 것 (1차)
- [ ] 주제 목록 파일
- [ ] 글쓰기 규칙
- [ ] 초안 쓰기 스킬
- [ ] 검수 담당 에이전트

## 이번에는 만들지 않을 것 (중요)
- 이미지 자동 생성 (2차에서)
- 자동 업로드 (아예 안 함. 사람이 직접 올린다)
- 여러 명이 같이 쓰는 기능 (필요 없음)

## 성공 기준
"손대는 곳이 3군데 이하면 성공."`}
        />
        <p className="text-[13px] text-neutral-500">
          <strong>&ldquo;이번에는 만들지 않을 것&rdquo;</strong> 칸을 꼭 채우세요. 이게 없으면 Claude가 친절하게 이것저것 더 만들어 줍니다.
          그러면 복잡해져서 결국 안 쓰게 됩니다.
        </p>

        {/* 0-5 */}
        <p className="pt-3 text-[14px] font-bold text-neutral-900">0-5. 혼자 못 쓰겠으면 Claude와 같이 쓰기</p>
        <p>
          기획을 혼자 쓰기 막막하면, Claude에게 <strong>질문을 시키세요.</strong> 답만 하면 기획서가 완성됩니다.
        </p>
        <CodeBlock
          label="Claude 채팅창에 그대로 입력"
          kind="panel"
          code={`나는 [여기에 하려는 일]을 자동화하고 싶어.
아직 뭘 만들지 정리가 안 됐어.

바로 만들지 말고, 먼저 나한테 질문을 해줘.
- 누가 쓰는지
- 무엇을 넣고 무엇을 받고 싶은지
- 쓰는 순간의 상황이 어떤지
- 어디까지는 사람이 하고 어디부터 자동으로 할지

한 번에 하나씩 물어보고, 내 답을 모아서
PLAN.md 파일로 정리해줘.`}
        />
        <p>
          더 좋은 방법은 <strong>Plan 모드</strong>를 켜는 것입니다. Claude 입력창 아래쪽 모드 표시를 눌러
          <strong> Plan</strong>으로 바꾸면, Claude가 <strong>바로 파일을 고치지 않고</strong> &ldquo;이렇게 만들겠습니다&rdquo;라는 계획서를
          먼저 문서로 보여줍니다. 거기에 직접 메모를 달아 고친 뒤 승인하면 그때부터 작업이 시작됩니다.
        </p>

        <Note title="이 단계에 15분만 쓰세요">
          <p>
            완벽한 기획서를 쓰려고 하면 시작을 못 합니다. <strong>한 문장 + 여정 5줄 + 단계 4개</strong>면 충분합니다.
            어차피 만들다 보면 바뀝니다. 바뀔 때마다 PLAN.md를 고치면 됩니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 4. Step 1 폴더 ─────────────────────────── */}
      <ResourceCard index="4" title="Step 1 — 작업 폴더를 만들고 VS Code로 엽니다">
        <p>
          Claude Code는 <strong>&ldquo;지금 열려 있는 폴더&rdquo;</strong>를 기준으로 움직입니다.
          그래서 프로젝트 전용 폴더를 하나 만들고, 그 폴더를 VS Code로 열어야 합니다.
        </p>

        <StepList
          items={[
            <>
              <p className="text-[14px] font-bold text-neutral-900">폴더 만들기</p>
              <p>
                문서 폴더 안에 새 폴더를 하나 만드세요. 이름은 영어 소문자와 하이픈으로 —
                예: <Mono>card-news</Mono>, <Mono>cs-reply</Mono>, <Mono>video-to-blog</Mono>.
              </p>
              <p className="text-[13px] text-neutral-500">
                한글이나 띄어쓰기가 들어가면 나중에 자잘한 오류가 생깁니다.
              </p>
            </>,
            <>
              <p className="text-[14px] font-bold text-neutral-900">VS Code에서 그 폴더 열기</p>
              <p>
                VS Code 상단 <Mono>File → Open Folder…</Mono>(파일 → 폴더 열기)를 눌러 방금 만든 폴더를 선택하세요.
                왼쪽에 폴더 이름이 뜨면 성공입니다.
              </p>
            </>,
            <>
              <p className="text-[14px] font-bold text-neutral-900">기획서부터 넣기</p>
              <p>
                왼쪽 폴더 이름 옆의 <strong>새 파일</strong> 아이콘을 눌러 <Mono>PLAN.md</Mono>를 만들고,
                Step 0에서 쓴 내용을 붙여넣으세요.
              </p>
              <p className="text-[13px] text-neutral-500">
                아직 안 썼다면, Claude 창을 열고 0-5의 문장을 붙여넣어 같이 쓰면 됩니다.
              </p>
            </>,
            <>
              <p className="text-[14px] font-bold text-neutral-900">Claude 창 열기</p>
              <p>
                오른쪽 아래 <Mono>✱ Claude Code</Mono>를 누르거나, 파일을 하나 연 상태에서 오른쪽 위 ✱ 아이콘을 누르세요.
                이제부터는 <strong>한국어로 그냥 말하면 됩니다.</strong>
              </p>
            </>,
          ]}
        />

        <Note title="Claude가 내 기획서를 봤는지 확인하려면">
          <p>
            채팅창에 <Mono>@</Mono>를 치면 폴더 안 파일 목록이 뜹니다. <Mono>@PLAN.md</Mono>를 골라 넣고
            &ldquo;이 파일 요약해줘&rdquo;라고 해보세요. 제대로 요약하면 잘 읽고 있는 겁니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 5. Step 2 규칙 ─────────────────────────── */}
      <ResourceCard index="5" title="Step 2 — 규칙(CLAUDE.md)을 만듭니다">
        <p>
          규칙은 <strong>기획서에서 뽑아냅니다.</strong> 없는 걸 지어내는 게 아니라,
          PLAN.md에 적어둔 것 중 &ldquo;매번 지켜야 하는 것&rdquo;만 옮겨 적는 겁니다.
        </p>

        <p className="text-[14px] font-bold text-neutral-900">방법 A — Claude에게 시키기 (추천)</p>
        <CodeBlock
          label="Claude 채팅창에 그대로 입력"
          kind="panel"
          code={`@PLAN.md 를 읽고, 이 프로젝트의 CLAUDE.md를 만들어줘.

기획서에 있는 내용 중에서
"작업할 때마다 항상 지켜야 하는 것"만 규칙으로 옮겨줘.
기획서에 없는 규칙을 새로 지어내지는 마.

그리고 "이번에는 만들지 않을 것" 항목은
'금지 사항' 섹션으로 꼭 넣어줘.`}
        />
        <p className="text-[13px] text-neutral-500">
          <Mono>/init</Mono>이라고만 쳐도 Claude가 폴더를 훑어보고 CLAUDE.md 초안을 만들어 줍니다.
          다만 기획서를 같이 읽히는 위 방식이 훨씬 정확합니다.
        </p>

        <p className="pt-2 text-[14px] font-bold text-neutral-900">완성되면 이런 파일이 됩니다</p>
        <CodeBlock
          label="파일: CLAUDE.md"
          code={`# 카드뉴스 프로젝트 규칙

## 이 프로젝트가 하는 일
주제 한 줄을 받아 인스타 카드뉴스 10장 초안을 만든다.
자세한 배경과 사용자 여정은 PLAN.md 참고.

## 절대 바꾸지 않는 숫자
| 항목 | 값 |
|------|-----|
| 한 세트 카드 수 | 10장 |
| 구성 | 표지 1 + 본문 8 + 마지막 1 |
| 이미지 크기 | 1080 x 1350 |

## 글자 수 규칙 (어기면 이미지에서 글자가 잘린다)
- 표지 제목: 두 줄, 각 줄 12자 이내
- 본문 소제목: 20자 이내
- 본문: 2~3문장, 150자 이내

## 말투
- 소상공인이 바로 알아들을 수 있는 쉬운 말로 쓴다.
- 전문 용어를 쓸 때는 괄호로 풀어준다.
- "~하세요"만 반복하지 않는다.

## 작업 방식
- 초안을 만들 때는 card-news-writer 스킬을 따른다.
- 초안이 나오면 card-reviewer 에이전트로 검수한 뒤 최종본을 낸다.
- 결과물은 output/ 폴더에 저장한다.

## 금지 사항
- 출처 없는 숫자와 통계
- "무조건", "폭발적", "100%" 같은 과장 표현
- 인스타 자동 업로드 (사람이 직접 올린다)
- 요청하지 않은 기능을 미리 만들어두기`}
        />

        <Note title="규칙은 짧게 시작하세요">
          <p>
            처음부터 완벽한 규칙을 쓰려고 하면 시작을 못 합니다. <strong>핵심 5줄</strong>로 시작하고,
            결과물이 마음에 안 들 때마다 &ldquo;아, 이건 규칙에 없었네&rdquo; 하면서 한 줄씩 추가하는 게 정석입니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 6. Step 3 스킬 ─────────────────────────── */}
      <ResourceCard index="6" title="Step 3 — 스킬(Skills)을 만듭니다">
        <p>
          스킬은 <strong>Step 0에서 쪼갠 단계 하나</strong>를 그대로 옮긴 것입니다.
          카드뉴스의 &lsquo;2단계 · 글쓰기&rsquo;가 곧 &lsquo;초안 쓰기 스킬&rsquo;이 됩니다.
        </p>
        <p>
          <strong>정해진 위치에 파일을 만들면 자동으로 인식</strong>됩니다. 위치가 정확해야 합니다.
        </p>

        <CodeBlock
          label="만들어야 할 폴더 구조"
          code={`card-news/
├── PLAN.md                            ← 기획서 (Step 0)
├── CLAUDE.md                          ← 규칙 (Step 2)
└── .claude/
    └── skills/
        └── card-news-writer/
            └── SKILL.md               ← 지금 만들 스킬`}
        />
        <p className="text-[13px] text-neutral-500">
          <Mono>.claude</Mono>처럼 점으로 시작하는 폴더는 숨김 폴더입니다. VS Code 왼쪽 목록에는 잘 보입니다.
        </p>

        <p className="pt-2 text-[14px] font-bold text-neutral-900">가장 쉬운 방법 — Claude에게 시키기</p>
        <CodeBlock
          label="Claude 채팅창에 그대로 입력"
          kind="panel"
          code={`@PLAN.md 의 작동 원리에서 "2단계 · 글쓰기"를
스킬로 만들어줘.

경로는 .claude/skills/card-news-writer/SKILL.md 로 하고,
CLAUDE.md에 있는 글자 수 규칙을 그대로 반영해줘.
description에는 "언제 이 스킬을 써야 하는지"를 꼭 써줘.`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">스킬 파일은 이렇게 생겼습니다</p>
        <p>
          맨 위 <Mono>---</Mono> 사이의 <strong>name</strong>과 <strong>description</strong>이 핵심입니다.
          Claude는 이 <strong>description</strong>만 보고 &ldquo;지금이 이 스킬을 꺼낼 때구나&rdquo;를 판단합니다.
          그래서 <strong>&ldquo;언제 쓰는지&rdquo;를 반드시 적어야 합니다.</strong>
        </p>
        <CodeBlock
          label="파일: .claude/skills/card-news-writer/SKILL.md"
          code={`---
name: card-news-writer
description: 인스타 카드뉴스 10장(표지 1 + 본문 8 + 마지막 1) 초안을 만든다. 주제나 소재를 주고 "카드뉴스 만들어줘"라고 할 때 사용한다.
---

# 카드뉴스 초안 쓰기

## 만드는 순서
1. 받은 주제를 "저장해두고 싶은 노하우" 각도로 한 줄로 다시 쓴다.
2. 표지 문구를 만든다. 두 줄, 각 줄 12자 이내.
3. 본문 8장을 만든다. 각 장은 소제목 + 본문 + 한 줄 팁.
4. 마지막 10번째 장은 저장과 공유를 유도하는 한 문장.

## 글자 수 (어기면 이미지에서 글자가 잘린다)
| 항목 | 최대 |
|------|------|
| 표지 한 줄 | 12자 |
| 소제목 | 20자 |
| 본문 | 150자 |
| 한 줄 팁 | 60자 |

## 8장을 채우는 기본 뼈대
1장: 이 문제가 왜 생기는가
2장: 대부분이 하는 실수
3~6장: 실제로 하는 방법 (한 장에 한 단계씩)
7장: 하면 안 되는 것
8장: 오늘 바로 해볼 한 가지

## 반드시 지킬 것
- 줄바꿈은 표지에만 쓴다. 소제목과 본문에는 넣지 않는다.
- 숫자를 쓸 때는 출처를 함께 적는다. 출처가 없으면 숫자를 쓰지 않는다.
- 각 장은 그 장만 봐도 이해되게 쓴다. "앞에서 말한" 같은 표현 금지.`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">다른 프로젝트라면 이런 스킬이 됩니다</p>
        <ExampleGrid
          rows={[
            {
              project: "예시 B · 문의 답변",
              body: (
                <p>
                  <Mono>reply-writer</Mono> — &ldquo;고객 문의 글을 주면 내 말투로 답변 초안 3가지를 만든다.
                  사과 → 사실 확인 → 해결책 → 다음 안내 순서로 쓴다.&rdquo;
                </p>
              ),
            },
            {
              project: "예시 C · 영상 → 블로그",
              body: (
                <p>
                  <Mono>transcript-to-post</Mono> — &ldquo;자막을 주면 소제목 5개로 나눈 블로그 글로 바꾼다.
                  구어체를 문어체로 고치고, 중복되는 말은 지운다.&rdquo;
                </p>
              ),
            },
          ]}
        />

        <Note title="스킬은 하나부터">
          <p>
            처음부터 스킬 5개를 만들면 Claude가 어떤 걸 꺼내야 할지 헷갈려 합니다.
            <strong> 가장 자주 하는 작업 하나만</strong> 만들어서 며칠 써보고, 반복되는 작업이 또 생기면 그때 추가하세요.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 7. Step 4 에이전트 ─────────────────────────── */}
      <ResourceCard index="7" title="Step 4 — 에이전트(Agents)를 만듭니다">
        <p>
          에이전트도 파일 하나가 직원 한 명입니다. 위치는 <Mono>.claude/agents/</Mono> 폴더입니다.
          만드는 방법은 스킬과 똑같이 <strong>Claude에게 시키면</strong> 됩니다.
        </p>

        <p className="text-[14px] font-bold text-neutral-900">검수 담당 직원 만들기</p>
        <p>
          어떤 프로젝트든 가장 먼저 만들면 좋은 직원은 <strong>검수 담당</strong>입니다.
          &ldquo;쓰는 사람&rdquo;과 &ldquo;고치는 사람&rdquo;을 분리하면 품질이 눈에 띄게 올라갑니다.
        </p>
        <CodeBlock
          label="Claude 채팅창에 그대로 입력"
          kind="panel"
          code={`검수 담당 에이전트를 만들어줘.
경로는 .claude/agents/card-reviewer.md.

CLAUDE.md의 글자 수 규칙과 금지 사항을 검사하고,
어긋난 부분을 직접 고쳐서 돌려주는 역할이야.
새로 쓰지는 말고 고치기만 하게 해줘.`}
        />

        <CodeBlock
          label="파일: .claude/agents/card-reviewer.md"
          code={`---
name: card-reviewer
description: 카드뉴스 초안이 글자 수와 말투 규칙을 지켰는지 검사하고, 어긋난 부분을 직접 고쳐서 돌려준다. 초안이 나온 직후에 사용한다.
tools: Read, Edit, Grep
---

너는 카드뉴스 검수 담당이다. 새로 쓰지 말고, 받은 초안을 고치기만 한다.

## 검사 순서
1. 표지 제목이 두 줄인가. 각 줄이 12자 이내인가.
2. 소제목에 줄바꿈이 없는가. 20자 이내인가.
3. 본문이 150자 이내인가.
4. 출처 없는 숫자가 있는가.
5. "무조건", "폭발적", "100%" 같은 과장 표현이 있는가.

## 고치는 방법
- 글자 수를 넘겼으면 뜻을 유지한 채 줄인다. 내용을 새로 지어내지 않는다.
- 출처 없는 숫자는 숫자를 빼고 문장을 다시 쓴다.
- 과장 표현은 담백한 표현으로 바꾼다.

## 보고 형식
고친 항목을 목록으로 먼저 보여주고, 그다음 완성본 전체를 준다.

- 3장 소제목: 24자 → 18자로 줄임
- 5장 본문: 출처 없는 "70%" 삭제`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">직원을 더 뽑고 싶다면</p>
        <p>
          <strong>Step 0에서 쪼갠 단계</strong>를 다시 보세요. 단계마다 담당을 하나씩 두면 됩니다.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>1단계 근거 모으기</strong> → <Mono>fact-finder</Mono> (웹에서 사례·숫자를 찾아 붙임)
          </li>
          <li>
            <strong>2단계 글쓰기</strong> → <Mono>writer</Mono> (스킬을 들고 초안 작성)
          </li>
          <li>
            <strong>3단계 검수</strong> → <Mono>card-reviewer</Mono> (위에서 만든 것)
          </li>
        </ul>

        <Note title="에이전트는 2명으로 시작하세요">
          <p>
            &lsquo;쓰는 사람&rsquo;과 &lsquo;고치는 사람&rsquo;. 이 둘만 있어도 충분합니다.
            역할을 너무 잘게 쪼개면 서로 미루다가 결과물이 오히려 흐려집니다.
          </p>
          <p>
            <strong>tools</strong> 줄은 &ldquo;이 직원이 쓸 수 있는 도구&rdquo;입니다. 검수 담당은 읽고 고치기만 하면 되니
            <Mono>Read, Edit, Grep</Mono>만 줍니다. 필요 없는 권한을 안 주는 게 사고를 막습니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 8. Step 5 첫 실행 ─────────────────────────── */}
      <ResourceCard index="8" title="Step 5 — 실제로 한 번 돌려봅니다">
        <p>
          여기까지 오셨으면 기획서 1개, 규칙 1개, 스킬 1개, 에이전트 1개가 준비된 상태입니다.
          이제 진짜로 돌려봅니다.
        </p>

        <CodeBlock
          label="Claude 채팅창에 그대로 입력"
          kind="panel"
          code={`"인스타 팔로워가 늘지 않는 진짜 이유"라는 주제로
카드뉴스 초안을 만들어줘.

다 쓰면 card-reviewer로 검수까지 해서
최종본을 output/ 폴더에 저장해줘.`}
        />

        <p>Claude가 이렇게 움직입니다.</p>
        <StepList
          items={[
            <p key="a">
              <Mono>CLAUDE.md</Mono>를 읽고 &ldquo;10장짜리 카드뉴스구나&rdquo;를 파악합니다.
            </p>,
            <p key="b">
              &ldquo;카드뉴스 만들어줘&rdquo;를 보고 <strong>card-news-writer 스킬</strong>을 꺼냅니다.
            </p>,
            <p key="c">스킬의 뼈대대로 표지 + 본문 8장 + 마지막 장을 씁니다.</p>,
            <p key="d">
              <strong>card-reviewer 에이전트</strong>를 불러 글자 수를 검사하고 고칩니다.
            </p>,
            <p key="e">
              파일을 만들기 전에 <strong>&ldquo;이렇게 바꿀게요&rdquo;라며 좌우 비교 화면</strong>을 띄웁니다.
            </p>,
          ]}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">VS Code에서만 되는 편한 것 3가지</p>
        <div className="space-y-2">
          {[
            [
              "바뀌는 내용을 미리 본다",
              "파일을 고치기 전에 왼쪽=원래 / 오른쪽=바뀔 내용으로 보여줍니다. 확인하고 승인/거절을 고르면 됩니다. 그 화면에서 직접 고쳐서 승인해도 됩니다.",
            ],
            [
              "되돌릴 수 있다",
              "대화 내용 위에 마우스를 올리면 되돌리기 버튼이 뜹니다. 그 시점의 파일 상태로 돌아갈 수 있어서, 마음 놓고 시도해볼 수 있습니다.",
            ],
            [
              "계획서를 먼저 받는다",
              "입력창 아래 모드를 Plan으로 바꾸면, 파일을 건드리기 전에 계획서를 문서로 먼저 보여줍니다. 큰 작업을 시킬 때 특히 유용합니다.",
            ],
          ].map(([a, b], i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-[13.5px] font-bold text-neutral-900">{a}</p>
              <p className="mt-0.5 text-[13px] leading-6 text-neutral-500">{b}</p>
            </div>
          ))}
        </div>

        <p className="pt-2">
          <strong>결과가 마음에 안 들면 그게 정상입니다.</strong> 여기서부터가 진짜 작업입니다.
        </p>
        <CodeBlock
          label="고칠 때 쓰는 말"
          kind="panel"
          code={`3장이 너무 뻔해. 실제 사례를 하나 넣어서 다시 써줘.

표지 문구가 밋밋해. 후보 5개 뽑아줘.

지금 고친 기준을 CLAUDE.md 규칙에 추가해줘.
다음부터는 처음부터 이렇게 나오게.`}
        />

        <Note title="이게 자동화의 핵심입니다">
          <p>
            &ldquo;고쳐줘&rdquo;로 끝내면 다음에 또 같은 걸 고쳐야 합니다.
            <strong> &ldquo;이 기준을 규칙에 추가해줘&rdquo;</strong>까지 해야 다음부터 그 실수가 사라집니다.
            10번쯤 반복하면 손댈 게 거의 없어집니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 9. Step 6 확장 ─────────────────────────── */}
      <ResourceCard index="9" title="Step 6 — 하나가 잘 되면, 그때 규모를 키웁니다">
        <p>
          한 번 돌려서 만족스러운 결과가 나오기 시작하면, 그때 <strong>PLAN.md의 &ldquo;2차&rdquo; 항목</strong>으로 넘어갑니다.
          순서를 바꾸지 마세요. 1차가 안 되는데 2차를 만들면 둘 다 안 됩니다.
        </p>

        <p className="text-[14px] font-bold text-neutral-900">6-1. 매번 하는 귀찮은 입력을 없앤다</p>
        <p>
          카드뉴스라면 &ldquo;매번 주제 생각하기&rdquo;가 제일 귀찮습니다. 미리 30~50개 적어두고 돌려 씁니다.
          문의 답변이라면 &ldquo;자주 오는 질문 목록&rdquo;, 블로그라면 &ldquo;내 글 형식 견본&rdquo;이 여기에 해당합니다.
        </p>
        <CodeBlock
          label="Claude 채팅창에 입력"
          kind="panel"
          code={`매번 주제를 생각하는 게 번거로워.
주제 목록 파일을 만들어줘.

분야 5개로 나눠서 분야당 8개씩, 총 40개.
각 주제에는 제목, 이 주제가 왜 저장할 만한지 한 줄,
웹 검색에 쓸 검색어 3개를 넣어줘.`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">6-2. 같은 게 반복되지 않게 한다</p>
        <CodeBlock
          label="CLAUDE.md에 추가할 규칙"
          code={`## 중복 방지
- 새로 만들기 전에 최근 4주에 쓴 것을 먼저 확인한다.
- 이미 쓴 것은 후보에서 제외한다.
- 한 주에 같은 분야가 3개 이상 나오지 않게 골고루 섞는다.`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">6-3. 지어낸 것처럼 보이지 않게 한다</p>
        <p>
          결과물이 &ldquo;AI가 쓴 것 같다&rdquo;는 느낌이 나는 가장 큰 이유는 <strong>근거 없이 쓰기 때문</strong>입니다.
          쓰기 전에 실제 자료를 먼저 모으게 하면 확 달라집니다.
        </p>
        <CodeBlock
          label="Claude 채팅창에 입력"
          kind="panel"
          code={`글을 쓰기 전에 그 주제로 웹 검색을 먼저 하게 만들어줘.
검색 결과에서 실제 사례와 구체적인 숫자만 뽑아서
글쓰기 단계에 근거로 넘겨줘.
검색이 실패하면 그냥 넘어가고 멈추지는 않게 해줘.`}
        />

        <p className="pt-2 text-[14px] font-bold text-neutral-900">6-4. 사람 손을 완전히 뗀다 (마지막 단계)</p>
        <p>
          여기까지 잘 돌아가면, &ldquo;매주 정해진 시각에 알아서 실행&rdquo;을 붙일 수 있습니다.
          이걸 <strong>크론(cron)</strong>이라고 부릅니다. 그냥 알람 시계라고 생각하세요.
          <strong> 이건 진짜 마지막에 하세요.</strong> 사람이 봐도 만족스럽지 않은 결과를 자동으로 뿌리면 손해만 커집니다.
        </p>

        <Note title="한 번에 다 하려고 하지 마세요">
          <p>
            6-1부터 6-4까지를 하루에 다 하려고 하면 100% 막힙니다.
            <strong> 하루에 하나씩</strong>, 각 단계가 제대로 도는 걸 눈으로 확인하고 다음으로 넘어가세요.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 10. 함정 ─────────────────────────── */}
      <ResourceCard index="10" title="실제로 겪은 함정 6가지 — 미리 알고 가세요">
        <p>
          아래는 제가 직접 운영하면서 터졌던 문제들입니다. 프로젝트가 달라도 <strong>거의 똑같이 겪습니다.</strong>
          전부 규칙 파일에 못 박아서 해결했습니다.
        </p>

        <div className="space-y-3">
          {[
            {
              t: "기획 없이 시작해서 방향이 계속 바뀐다",
              b: "가장 흔하고, 가장 비쌉니다. 만들다가 '이게 아닌데' 싶어 갈아엎기를 반복합니다. PLAN.md를 먼저 쓰고, 방향이 흔들릴 때마다 그 파일을 다시 읽으세요.",
            },
            {
              t: "요청하지 않은 걸 자꾸 더 만들어준다",
              b: "Claude는 친절해서 '이것도 있으면 좋겠죠?' 하며 기능을 더 만듭니다. PLAN.md의 '이번에는 만들지 않을 것'을 CLAUDE.md 금지 사항에 그대로 옮겨두면 멈춥니다.",
            },
            {
              t: "결과물이 정해진 틀을 벗어난다",
              b: "글자가 잘리거나, 형식이 매번 다릅니다. 숫자 제한을 규칙에 표로 적고, 검수 에이전트가 마지막에 한 번 거르게 하세요. 사람이 눈으로 확인할 시간은 없습니다.",
            },
            {
              t: "고치고 나니 다른 게 사라졌다",
              b: "검수 단계에서 다시 만들면, 원래 붙어 있던 정보가 통째로 날아갑니다. '고칠 때는 원본의 나머지 정보를 그대로 이어붙인다'를 규칙에 적어두세요.",
            },
            {
              t: "같은 결과물이 또 나온다",
              b: "최근에 만든 것 목록을 저장해두고, 새로 만들 때 그 목록을 먼저 보게 만드세요.",
            },
            {
              t: "중간에 멈췄는데 아무도 모른다",
              b: "자동으로 돌리기 시작하면 조용히 실패합니다. 마지막에 '감독자' 역할을 하나 더 돌려서, 빠진 게 있으면 채우고 없으면 그냥 지나가게 만드세요.",
            },
          ].map((x, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-[13.5px] font-bold text-neutral-900">
                {i + 1}. {x.t}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-neutral-600">{x.b}</p>
            </div>
          ))}
        </div>
      </ResourceCard>

      {/* ─────────────────────────── 11. 복붙 ─────────────────────────── */}
      <ResourceCard index="11" title="복사해서 바로 쓰는 문장 모음">
        <p>Claude 채팅창에 그대로 붙여넣으세요. 대괄호 부분만 본인 것으로 바꾸면 됩니다.</p>

        <p className="text-[13px] font-bold text-neutral-900">① 기획부터 시작할 때</p>
        <CodeBlock
          label="복사해서 붙여넣기"
          kind="panel"
          code={`나는 [하려는 일]을 자동화하고 싶어.
바로 만들지 말고 먼저 나한테 질문을 해줘.

누가 쓰는지 / 무엇을 넣고 무엇을 받는지 /
쓰는 순간의 상황 / 어디까지 사람이 하고 어디부터 자동인지.

한 번에 하나씩 물어보고, 내 답을 모아서
PLAN.md로 정리해줘.
"이번에는 만들지 않을 것" 항목도 꼭 넣어줘.`}
        />

        <p className="pt-2 text-[13px] font-bold text-neutral-900">② 기획이 끝나고 세팅할 때</p>
        <CodeBlock
          label="복사해서 붙여넣기"
          kind="panel"
          code={`@PLAN.md 를 읽고 이 폴더를 세팅해줘.

1. CLAUDE.md — 항상 지켜야 할 규칙
2. .claude/skills/[스킬이름]/SKILL.md — 핵심 작업 하나
3. .claude/agents/[에이전트이름].md — 검수 담당

기획서에 없는 내용을 새로 지어내지는 마.`}
        />

        <p className="pt-2 text-[13px] font-bold text-neutral-900">③ 결과가 마음에 안 들 때</p>
        <CodeBlock
          label="복사해서 붙여넣기"
          kind="panel"
          code={`지금 나온 결과에서 [마음에 안 드는 점]이 문제야.
이걸 고치고, 같은 문제가 다시 안 생기게
CLAUDE.md 규칙이나 스킬 파일에 기준을 추가해줘.`}
        />

        <p className="pt-2 text-[13px] font-bold text-neutral-900">④ 뭐가 뭔지 모르겠을 때</p>
        <CodeBlock
          label="복사해서 붙여넣기"
          kind="panel"
          code={`지금 이 폴더에 뭐가 들어 있고 각각 뭘 하는 건지
컴퓨터를 모르는 사람도 알아듣게 설명해줘.`}
        />
      </ResourceCard>

      {/* ─────────────────────────── 12. 체크리스트 ─────────────────────────── */}
      <ResourceCard index="12" title="이번 주 과제 체크리스트">
        <p>이 순서대로만 하면 됩니다. 하루에 하나씩 해도 충분합니다.</p>
        <div className="space-y-2">
          {[
            "VS Code 설치하고 Claude Code 확장 설치 + 로그인하기",
            "내가 자동화하고 싶은 일을 한 문장으로 써보기",
            "사용자 여정 5줄 써보기 (내가 이걸 쓰는 장면)",
            "작동 원리를 단계로 쪼개보기 (입력 → 처리 → 출력)",
            "PLAN.md 만들기 — '이번에는 만들지 않을 것'까지",
            "프로젝트 폴더 만들고 VS Code로 열기",
            "PLAN.md를 읽혀서 CLAUDE.md 만들기",
            "스킬 1개 만들기 (가장 자주 하는 작업)",
            "검수 담당 에이전트 1개 만들기",
            "실제로 한 번 돌려보기",
            "마음에 안 드는 점 3개 찾아서 규칙에 추가하기",
            "다시 돌려서 좋아졌는지 비교하기",
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-neutral-300" />
              <span className="text-[14px] leading-6 text-neutral-700">{x}</span>
            </div>
          ))}
        </div>
        <Note title="12번까지 했다면">
          <p>
            이미 자동화의 본질을 다 배운 겁니다. 남은 건 규모를 늘리는 것뿐이고,
            그건 Step 6을 하루에 하나씩 따라 하면 됩니다.
          </p>
        </Note>
      </ResourceCard>

      {/* ─────────────────────────── 13. 강사용 ─────────────────────────── */}
      <ResourceCard index="13" title="강의 진행 순서 (강사용 60분 구성)">
        <div className="space-y-2.5">
          {[
            ["0-05분", "완성된 결과물을 먼저 보여준다. 결과부터 봐야 집중한다."],
            ["05-10분", "규칙 · 스킬 · 에이전트를 식당 비유로 설명하고, '기획이 0단계'임을 못 박는다."],
            ["10-18분", "화면 공유로 VS Code 확장 설치 + 로그인 + Claude 창 여는 4가지 방법을 같이 한다."],
            ["18-33분", "Step 0 기획. 수강생 한 명의 실제 사례를 받아 한 문장 → 여정 → 작동 원리를 실시간으로 만든다. 여기가 이번 강의의 중심."],
            ["33-40분", "PLAN.md를 읽혀서 CLAUDE.md를 만든다. 규칙이 기획서에서 나온다는 걸 눈으로 보여준다."],
            ["40-47분", "스킬 파일을 만들고, description이 왜 중요한지(언제 꺼낼지 판단하는 근거) 강조한다."],
            ["47-53분", "에이전트로 검수를 붙이고, 좌우 비교 화면과 되돌리기를 시연한다."],
            ["53-58분", "실전 함정 6가지. 특히 1번(기획 없이 시작)과 2번(요청 안 한 걸 더 만듦)을 강조."],
            ["58-60분", "체크리스트를 띄우고 이번 주 과제를 안내한다."],
          ].map(([time, desc], i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span className="w-16 shrink-0 text-[12px] font-black tabular-nums text-pink-600">{time}</span>
              <span className="flex-1 text-[13.5px] leading-6 text-neutral-700">{desc}</span>
            </div>
          ))}
        </div>

        <Note title="강의할 때 꼭 짚어야 할 두 문장">
          <p>
            &ldquo;Claude를 잘 쓰는 사람은 프롬프트를 잘 쓰는 사람이 아니라, <strong>자기 기준을 글로 정리해 둔 사람</strong>입니다.&rdquo;
          </p>
          <p>
            &ldquo;그리고 그 기준은 <strong>무엇을 만들지 정해진 다음에야</strong> 나옵니다. 그래서 기획이 0단계입니다.&rdquo;
          </p>
        </Note>
      </ResourceCard>

      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 text-sm text-pink-700">
        <p className="font-semibold">한 줄 요약</p>
        <p className="mt-2 leading-6">
          자동화는 코딩이 아니라 <strong>기준을 글로 적어두는 일</strong>입니다.
          무엇을 만들지 정하고(기획), 항상 지킬 것을 적고(규칙), 작업 순서를 만들고(스킬), 검수를 맡기면(에이전트)
          그다음부터는 컴퓨터가 반복합니다. 오늘은 <strong>한 문장짜리 기획서</strong>부터 써보세요.
        </p>
        <div className="mt-4">
          <Link href="/" className="inline-flex items-center font-semibold text-pink-700 hover:text-pink-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </ResourceLayout>
  );
}
