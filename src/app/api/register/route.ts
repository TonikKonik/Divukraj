import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password || username.length < 2 || password.length < 6) {
    return NextResponse.json({ error: "Neplatné údaje" }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: "Jméno je již obsazeno" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await db.user.create({ data: { username, password: hashed } })

  return NextResponse.json({ ok: true })
}
