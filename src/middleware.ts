import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const isPublic = pathname === "/login"

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/lobby", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
