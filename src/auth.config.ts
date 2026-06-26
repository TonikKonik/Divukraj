import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic = nextUrl.pathname === "/login"
      if (!isLoggedIn && !isPublic) return false
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/lobby", nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
