import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string | null }
  }
}

declare module "next-auth/jwt" {
  interface JWT { id: string }
}

const ALLOWED_USERS = ["Tonda", "Patrik", "Andrea", "Jarda", "Irena"]
const SHARED_PASSWORD = "Divukraj2026"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Uživatelské jméno", type: "text" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined
        if (!username || !password) return null
        if (!ALLOWED_USERS.includes(username)) return null
        if (password !== SHARED_PASSWORD) return null

        const user = await db.user.upsert({
          where: { username },
          create: { username },
          update: {},
        })

        return { id: user.id, name: user.username, email: null }
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
})
