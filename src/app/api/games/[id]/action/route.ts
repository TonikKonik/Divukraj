import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { CARDS } from "@/lib/cards"

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

function nextIdx(current: number, total: number) {
  return (current + 1) % total
}

// Resources gained by deploying to each basic location
const LOCATION_GAIN: Record<string, { twigs?: number; resin?: number; pebbles?: number; berries?: number; cards?: number }> = {
  TWIGS:       { twigs: 2 },
  RESIN:       { resin: 1 },
  PEBBLES:     { pebbles: 1 },
  BERRIES:     { berries: 2 },
  CARDS:       { cards: 2 },
  CARDS_TWIGS: { cards: 1, twigs: 1 },
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return err("Nepřihlášen", 401)

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.type) return err("Chybí typ akce")

  const gameState = await db.gameState.findUnique({
    where: { gameId: id },
    include: {
      playerStates: true,
      workers: true,
      game: {
        include: {
          players: { orderBy: { joinedAt: "asc" } },
        },
      },
    },
  })

  if (!gameState) return err("Hra nenalezena", 404)
  if (gameState.game.status !== "PLAYING") return err("Hra neprobíhá")

  const players = gameState.game.players
  const currentPlayer = players[gameState.currentPlayerIdx]
  if (currentPlayer.userId !== session.user.id) return err("Nejsi na tahu", 403)

  const myState = gameState.playerStates.find((p) => p.userId === session.user.id)
  if (!myState) return err("Herní stav hráče nenalezen", 404)

  const myWorkers = gameState.workers.filter((w) => w.userId === session.user.id)
  const advanceTurn = nextIdx(gameState.currentPlayerIdx, players.length)

  // ─── DEPLOY WORKER ───────────────────────────────────────────────────────────
  if (body.type === "DEPLOY_WORKER") {
    const { location } = body as { location: string }
    const gain = LOCATION_GAIN[location]
    if (!gain) return err(`Neznámá lokace: ${location}`)

    if (myWorkers.length >= 2) return err("Nemáš volné pomocníky")
    if (myWorkers.some((w) => w.location === location)) {
      return err("Tuto lokaci již obsazuješ")
    }

    let deck = [...gameState.deck]
    let hand = [...myState.hand]
    const drawn = Math.min(gain.cards ?? 0, deck.length)
    if (drawn > 0) {
      hand = [...hand, ...deck.slice(0, drawn)]
      deck = deck.slice(drawn)
    }

    await db.$transaction([
      db.workerPlacement.create({
        data: { gameStateId: gameState.id, userId: session.user.id, location, season: gameState.season },
      }),
      db.playerState.update({
        where: { id: myState.id },
        data: {
          twigs:   myState.twigs   + (gain.twigs   ?? 0),
          resin:   myState.resin   + (gain.resin   ?? 0),
          pebbles: myState.pebbles + (gain.pebbles ?? 0),
          berries: myState.berries + (gain.berries ?? 0),
          hand,
        },
      }),
      db.gameState.update({
        where: { id: gameState.id },
        data: { deck, currentPlayerIdx: advanceTurn },
      }),
    ])

    return NextResponse.json({ ok: true })
  }

  // ─── PLAY CARD FROM HAND ──────────────────────────────────────────────────────
  if (body.type === "PLAY_CARD") {
    const { cardId, fromMeadow = false, meadowIdx } = body as {
      cardId: string
      fromMeadow?: boolean
      meadowIdx?: number
    }

    const cardDef = CARDS[cardId]
    if (!cardDef) return err(`Neznámá karta: ${cardId}`)

    // Find the card
    let newHand = [...myState.hand]
    let newMeadow = [...gameState.meadow]
    let newDeck = [...gameState.deck]
    let newDiscard = [...gameState.discard]

    if (fromMeadow) {
      const idx = meadowIdx ?? newMeadow.indexOf(cardId)
      if (idx < 0 || newMeadow[idx] !== cardId) return err("Karta není na Louce")
      newMeadow.splice(idx, 1)
      // Replenish meadow from deck
      if (newDeck.length > 0) {
        newMeadow.push(newDeck[0])
        newDeck = newDeck.slice(1)
      }
    } else {
      const handIdx = newHand.indexOf(cardId)
      if (handIdx < 0) return err("Karta není v ruce")
      newHand.splice(handIdx, 1)
    }

    // Check if card can be played for free via paired construction in city
    const hasPaired =
      cardDef.pairedWith !== undefined &&
      cardDef.type === "CRITTER" &&
      myState.city.includes(cardDef.pairedWith)

    // Calculate effective cost
    const cost = hasPaired
      ? {}
      : {
          twigs:   cardDef.cost.twigs   ?? 0,
          resin:   cardDef.cost.resin   ?? 0,
          pebbles: cardDef.cost.pebbles ?? 0,
          berries: cardDef.cost.berries ?? 0,
        }

    if (
      myState.twigs   < (cost.twigs   ?? 0) ||
      myState.resin   < (cost.resin   ?? 0) ||
      myState.pebbles < (cost.pebbles ?? 0) ||
      myState.berries < (cost.berries ?? 0)
    ) {
      return err("Nedostatek surovin")
    }

    if (myState.city.length >= 15) return err("Město je plné (max. 15 karet)")

    // Immediate production effects for GREEN cards
    let twigs   = myState.twigs   - (cost.twigs   ?? 0)
    let resin   = myState.resin   - (cost.resin   ?? 0)
    let pebbles = myState.pebbles - (cost.pebbles ?? 0)
    let berries = myState.berries - (cost.berries ?? 0)

    switch (cardId) {
      case "FARM":          berries += 1; break
      case "GENERAL_STORE": berries += myState.city.includes("FARM") ? 2 : 1; break
      case "MINE":          pebbles += 1; break
      case "RESIN_REFINERY": resin  += 1; break
      case "TWIG_BARGE":    twigs   += 2; break
      case "BARGE_TOAD":    twigs   += 2 * myState.city.filter((c) => c === "FARM").length; break
      case "WANDERER": {
        const drawn = Math.min(3, newDeck.length)
        newHand = [...newHand, ...newDeck.slice(0, drawn)]
        newDeck = newDeck.slice(drawn)
        break
      }
      case "CHIP_SWEEP":
        // Activate 1 production card in city — auto-activate FARM for simplicity
        if (myState.city.includes("FARM")) berries += 1
        break
      case "SHEPHERD":
        berries += 3
        break
      case "PEDDLER":
        // No auto effect — requires player choice; skip for now
        break
    }

    const newCity = [...myState.city, cardId]

    await db.$transaction([
      db.playerState.update({
        where: { id: myState.id },
        data: { twigs, resin, pebbles, berries, hand: newHand, city: newCity },
      }),
      db.gameState.update({
        where: { id: gameState.id },
        data: { meadow: newMeadow, deck: newDeck, discard: newDiscard, currentPlayerIdx: advanceTurn },
      }),
    ])

    return NextResponse.json({ ok: true, free: hasPaired })
  }

  // ─── PREPARE FOR SEASON ────────────────────────────────────────────────────────
  if (body.type === "PREPARE_SEASON") {
    const SEASONS = ["SPRING", "SUMMER", "AUTUMN", "WINTER"] as const
    type Season = typeof SEASONS[number]

    const seasonIdx = SEASONS.indexOf(gameState.season as Season)

    // Recall this player's workers
    await db.workerPlacement.deleteMany({
      where: { gameStateId: gameState.id, userId: session.user.id },
    })

    // Seasonal bonus: draw 2 cards + gain resources based on production cards in city
    let deck = [...gameState.deck]
    let hand = [...myState.hand]
    const drawn = Math.min(2, deck.length)
    hand = [...hand, ...deck.slice(0, drawn)]
    deck = deck.slice(drawn)

    // Simple production: each green production card fires
    let twigs   = myState.twigs
    let resin   = myState.resin
    let pebbles = myState.pebbles
    let berries = myState.berries

    for (const cid of myState.city) {
      switch (cid) {
        case "FARM":          berries += 1; break
        case "MINE":          pebbles += 1; break
        case "RESIN_REFINERY": resin  += 1; break
        case "TWIG_BARGE":    twigs   += 2; break
        case "GENERAL_STORE": berries += myState.city.includes("FARM") ? 2 : 1; break
      }
    }

    // Check if all players have no workers (everyone prepared)
    const remainingWorkers = gameState.workers.filter((w) => w.userId !== session.user.id)
    let newSeason = gameState.season
    if (remainingWorkers.length === 0 && seasonIdx < 3) {
      newSeason = SEASONS[seasonIdx + 1]
    }

    await db.$transaction([
      db.playerState.update({
        where: { id: myState.id },
        data: { twigs, resin, pebbles, berries, hand },
      }),
      db.gameState.update({
        where: { id: gameState.id },
        data: { deck, season: newSeason, currentPlayerIdx: advanceTurn },
      }),
    ])

    return NextResponse.json({ ok: true, newSeason })
  }

  return err("Neznámý typ akce")
}
