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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
