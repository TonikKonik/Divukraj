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
        const usernameRaw = (credentials?.username as string | undefined)?.trim()
        const password = (credentials?.password as string | undefined)?.trim()
        if (!usernameRaw || !password) return null

        const canonical = ALLOWED_USERS.find(
          (u) => u.toLowerCase() === usernameRaw.toLowerCase()
        )
        if (!canonical) return null
        if (password !== SHARED_PASSWORD) return null

        try {
          const user = await db.user.upsert({
            where: { username: canonical },
            create: { username: canonical },
            update: {},
          })
          return { id: user.id, name: user.username, email: null }
        } catch (e) {
          console.error("[Auth] DB upsert failed:", e)
          return null
        }
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
