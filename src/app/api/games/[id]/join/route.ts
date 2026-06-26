import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
const COLORS = ["RED", "BLUE", "GREEN", "ORANGE"] as const
type PlayerColor = typeof COLORS[number]

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
  if (game.status !== "LOBBY") return NextResponse.json({ error: "Hra již probíhá" }, { status: 400 })
  if (game.players.length >= game.maxPlayers) return NextResponse.json({ error: "Hra je plná" }, { status: 400 })
  if (game.players.some((p) => p.userId === session.user.id)) {
    return NextResponse.json({ error: "Již jsi ve hře" }, { status: 400 })
  }

  const usedColors = new Set(game.players.map((p) => p.color))
  const color = COLORS.find(c => !usedColors.has(c))!

  await db.gamePlayer.create({
    data: { gameId: id, userId: session.user.id, color },
  })

  return NextResponse.json({ ok: true })
}
