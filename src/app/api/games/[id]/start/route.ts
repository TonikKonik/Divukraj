import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 })

  const { id } = await params

  const game = await db.game.findUnique({
    where: { id },
    include: { players: true },
  })

  if (!game) return NextResponse.json({ error: "Hra nenalezena" }, { status: 404 })
  if (game.hostId !== session.user.id) return NextResponse.json({ error: "Nejsi hostitel" }, { status: 403 })
  if (game.status !== "LOBBY") return NextResponse.json({ error: "Hra již probíhá" }, { status: 400 })
  if (game.players.length < 2) return NextResponse.json({ error: "Potřebuješ alespoň 2 hráče" }, { status: 400 })

  await db.game.update({
    where: { id },
    data: { status: "PLAYING" },
  })

  return NextResponse.json({ ok: true })
}
