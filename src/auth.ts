import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string | null }
  }
}

const ALLOWED_USERS = ["Tonda", "Patrik", "Andrea", "Jarda", "Irena"]
const SHARED_PASSWORD = "Divukraj2026"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ""
      return session
    },
  },
})
