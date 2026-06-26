import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const games = await db.game.findMany({
    where: { status: { not: "FINISHED" } },
    include: {
      host: { select: { id: true, username: true } },
      players: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(games)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 })

  const { name, maxPlayers = 4 } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Zadej název hry" }, { status: 400 })

  const game = await db.game.create({
    data: {
      name: name.trim(),
      maxPlayers: Math.min(4, Math.max(2, maxPlayers)),
      hostId: session.user.id,
      players: {
        create: { userId: session.user.id, color: "RED" },
      },
    },
  })

  return NextResponse.json(game, { status: 201 })
}
