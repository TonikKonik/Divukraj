import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { buildDeck, shuffleDeck } from "@/lib/cards"

const HAND_SIZE = 5
const MEADOW_SIZE = 8

// Starting resources by player order (index 0 = first player)
const STARTING_RESOURCES = [
  { twigs: 0, resin: 0, pebbles: 0, berries: 0 },
  { twigs: 1, resin: 0, pebbles: 0, berries: 0 },
  { twigs: 1, resin: 1, pebbles: 0, berries: 0 },
  { twigs: 1, resin: 1, pebbles: 1, berries: 0 },
]

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 })

  const { id } = await params

  const game = await db.game.findUnique({
    where: { id },
    include: { players: { include: { user: true }, orderBy: { joinedAt: "asc" } } },
  })

  if (!game) return NextResponse.json({ error: "Hra nenalezena" }, { status: 404 })
  if (game.hostId !== session.user.id) return NextResponse.json({ error: "Nejsi hostitel" }, { status: 403 })
  if (game.status !== "LOBBY") return NextResponse.json({ error: "Hra již probíhá" }, { status: 400 })
  if (game.players.length < 2) return NextResponse.json({ error: "Potřebuješ alespoň 2 hráče" }, { status: 400 })

  let deck = shuffleDeck(buildDeck())

  const meadow = deck.slice(0, MEADOW_SIZE)
  deck = deck.slice(MEADOW_SIZE)

  const playerStateData = game.players.map((player: { userId: string }, idx: number) => {
    const hand = deck.slice(0, HAND_SIZE)
    deck = deck.slice(HAND_SIZE)
    const res = STARTING_RESOURCES[idx] ?? STARTING_RESOURCES[0]
    return {
      userId: player.userId,
      hand,
      city: [] as string[],
      ...res,
    }
  })

  await db.$transaction([
    db.game.update({ where: { id }, data: { status: "PLAYING" } }),
    db.gameState.create({
      data: {
        gameId: id,
        meadow,
        deck,
        discard: [],
        playerStates: { create: playerStateData },
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}
