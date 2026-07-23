import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Kakao from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { triggerWorkflow } from "@/lib/crm/workflow-engine";

// 카카오가 이메일을 주지 않는 경우(비즈앱 전환 전) User.email(필수·unique)을 채우기 위한 임시 이메일.
// 나중에 비즈앱으로 실제 이메일을 받으면 그 값이 그대로 쓰여 자동 연결이 동작한다.
const KAKAO_PLACEHOLDER_DOMAIN = "kakao.local";
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${KAKAO_PLACEHOLDER_DOMAIN}`);
}

// 카카오가 준 전화번호("+82 10-1234-5678")를 국내 형식(01012345678)으로 정규화
function normalizeKrPhone(p: string): string {
  let s = p.replace(/[^\d+]/g, "");
  if (s.startsWith("+82")) s = "0" + s.slice(3);
  return s;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      // 카카오가 준 이메일이 기존 계정 이메일과 같으면 자동 연결(이메일이 있을 때만 작동)
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        const account = (profile as { kakao_account?: { email?: string; profile?: { nickname?: string; profile_image_url?: string } } }).kakao_account;
        const email = account?.email?.trim().toLowerCase();
        return {
          id: String(profile.id),
          name: account?.profile?.nickname ?? null,
          image: account?.profile?.profile_image_url ?? null,
          // 이메일 미제공 시 카카오 id 기반 placeholder로 채움(계정 생성 성공 보장)
          email: email || `kakao_${profile.id}@${KAKAO_PLACEHOLDER_DOMAIN}`,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  events: {
    // OAuth(카카오)로 신규 유저가 생성될 때 CRM 훅을 태운다.
    // (기존 이메일/비번 가입은 /api/auth/register 에서 이미 처리하므로 여기선 실이메일 소셜 가입만 대상)
    async createUser({ user }) {
      if (!user.email || isPlaceholderEmail(user.email)) return; // 이메일 없으면 CRM 스킵
      try {
        const contact = await upsertContactByEmail({
          email: user.email,
          name: user.name,
          source: "kakao",
        });
        await prisma.user.update({ where: { id: user.id }, data: { contactId: contact.id } });
        await logEvent(contact.id, "register", { userId: user.id, via: "kakao" });
        await triggerWorkflow("register", contact.id, { userId: user.id, via: "kakao" });
      } catch {
        // CRM 훅 실패가 로그인 자체를 막지 않도록 삼킴
      }
    },
    // 카카오 로그인 시 전화번호 동의값이 오면 Contact에 저장(비어있을 때만).
    // 전화번호 동의항목 검수가 통과되어야 profile.kakao_account.phone_number가 들어온다.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "kakao" || !profile || !user?.id) return;
      const kakaoAccount = (profile as { kakao_account?: { phone_number?: string } }).kakao_account;
      const raw = kakaoAccount?.phone_number;
      if (!raw) return;
      const phone = normalizeKrPhone(raw);
      if (!phone) return;
      try {
        const u = await prisma.user.findUnique({
          where: { id: user.id },
          select: { contactId: true },
        });
        if (!u?.contactId) return; // 이메일 없는 카카오 유저는 Contact가 없어 저장 위치가 없음
        const c = await prisma.contact.findUnique({
          where: { id: u.contactId },
          select: { phone: true },
        });
        if (c && !c.phone) {
          await prisma.contact.update({ where: { id: u.contactId }, data: { phone } });
        }
      } catch {
        // 실패해도 로그인은 계속
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
