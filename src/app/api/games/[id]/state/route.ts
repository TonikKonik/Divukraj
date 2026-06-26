import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 })

  const { id } = await params

  const state = await db.gameState.findUnique({
    where: { gameId: id },
    include: {
      playerStates: true,
      workers: true,
      game: {
        include: {
          players: { include: { user: { select: { id: true, username: true } } }, orderBy: { joinedAt: "asc" } },
        },
      },
    },
  })

  if (!state) return NextResponse.json({ error: "Stav hry nenalezen" }, { status: 404 })

  const myState = state.playerStates.find((p) => p.userId === session.user.id)

  return NextResponse.json({
    season: state.season,
    currentPlayerIdx: state.currentPlayerIdx,
    meadow: state.meadow,
    deckSize: state.deck.length,
    discardSize: state.discard.length,
    players: state.game.players.map((gp, idx) => {
      const ps = state.playerStates.find((p) => p.userId === gp.userId)
      const isMe = gp.userId === session.user.id
      return {
        userId: gp.userId,
        username: gp.user.username,
        color: gp.color,
        idx,
        twigs: ps?.twigs ?? 0,
        resin: ps?.resin ?? 0,
        pebbles: ps?.pebbles ?? 0,
        berries: ps?.berries ?? 0,
        cityCards: ps?.city ?? [],
        handSize: isMe ? undefined : (ps?.hand.length ?? 0),
        hand: isMe ? ps?.hand ?? [] : undefined,
        workers: state.workers.filter((w) => w.userId === gp.userId),
      }
    }),
    myHand: myState?.hand ?? [],
  })
}
