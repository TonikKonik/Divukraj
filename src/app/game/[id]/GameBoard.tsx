"use client"

import { useEffect, useState, useCallback } from "react"
import { CARDS, COLOR_LABELS } from "@/lib/cards"
import type { CardColor } from "@/lib/cards"
import styles from "./GameBoard.module.css"

interface Worker { id: string; location: string; season: string }

interface PlayerInfo {
  userId: string
  username: string
  color: string
  idx: number
  twigs: number
  resin: number
  pebbles: number
  berries: number
  cityCards: string[]
  handSize?: number
  hand?: string[]
  workers: Worker[]
}

interface GameStateData {
  season: string
  currentPlayerIdx: number
  meadow: string[]
  deckSize: number
  discardSize: number
  players: PlayerInfo[]
  myHand: string[]
}

const SEASON_LABELS: Record<string, string> = {
  SPRING: "Jaro",
  SUMMER: "Léto",
  AUTUMN: "Podzim",
  WINTER: "Zima",
}

const PLAYER_COLOR_HEX: Record<string, string> = {
  RED: "#c62828",
  BLUE: "#1565c0",
  GREEN: "#2e7d32",
  ORANGE: "#e65100",
}

const CARD_COLOR_HEX: Record<CardColor, string> = {
  GREEN: "#388e3c",
  RED: "#c62828",
  BLUE: "#1565c0",
  TAN: "#8d6e63",
  PURPLE: "#6a1b9a",
}

// Basic locations where workers can be placed
const BASIC_LOCATIONS = [
  { id: "TWIGS", label: "Les", resource: "🪵🪵", desc: "2 větvičky" },
  { id: "RESIN", label: "Bažina", resource: "🫧", desc: "1 pryskyřice" },
  { id: "PEBBLES", label: "Jeskyně", resource: "🪨", desc: "1 kamínek" },
  { id: "BERRIES", label: "Zahrada", resource: "🫐🫐", desc: "2 bobule" },
  { id: "CARDS", label: "Rybník", resource: "🃏🃏", desc: "2 karty" },
  { id: "CARDS_TWIGS", label: "Keře", resource: "🃏🪵", desc: "1 karta + 1 větvička" },
]

function CardTile({ cardId, showEffect = false }: { cardId: string; showEffect?: boolean }) {
  const card = CARDS[cardId]

  if (!card) {
    return (
      <div className={styles.card} style={{ borderColor: "#555" }}>
        <div className={styles.cardColor} style={{ background: "#555" }} />
        <div className={styles.cardName}>{cardId}</div>
      </div>
    )
  }

  const color = CARD_COLOR_HEX[card.color] ?? "#666"
  const costParts: string[] = []
  if (card.cost.twigs) costParts.push(`🪵${card.cost.twigs}`)
  if (card.cost.resin) costParts.push(`🫧${card.cost.resin}`)
  if (card.cost.pebbles) costParts.push(`🪨${card.cost.pebbles}`)
  if (card.cost.berries) costParts.push(`🫐${card.cost.berries}`)
  const costStr = costParts.length ? costParts.join(" ") : "Zdarma"

  return (
    <div className={styles.card} style={{ borderColor: color }}>
      <div className={styles.cardColor} style={{ background: color }} />
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardMeta}>
        {card.type === "CRITTER" ? "Obyvatel" : "Stavba"}
        {" · "}
        <span style={{ color: COLOR_LABELS[card.color] ? color : undefined }}>
          {COLOR_LABELS[card.color]}
        </span>
      </div>
      <div className={styles.cardPoints}>{card.points} VP</div>
      <div className={styles.cardCost}>{costStr}</div>
      {showEffect && <div className={styles.cardEffect}>{card.effectText}</div>}
    </div>
  )
}

function Resources({ twigs, resin, pebbles, berries }: {
  twigs: number; resin: number; pebbles: number; berries: number
}) {
  return (
    <div className={styles.resources}>
      <span title="Větvičky">🪵 <b>{twigs}</b></span>
      <span title="Pryskyřice">🫧 <b>{resin}</b></span>
      <span title="Kamínky">🪨 <b>{pebbles}</b></span>
      <span title="Bobule">🫐 <b>{berries}</b></span>
    </div>
  )
}

export default function GameBoard({
  gameId,
  currentUserId,
}: {
  gameId: string
  currentUserId: string
}) {
  const [state, setState] = useState<GameStateData | null>(null)
  const [fetchError, setFetchError] = useState("")

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/state`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setFetchError(body?.error ?? "Chyba načítání stavu hry")
        return
      }
      const data = await res.json()
      setState(data)
      setFetchError("")
    } catch {
      setFetchError("Síťová chyba")
    }
  }, [gameId])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 3000)
    return () => clearInterval(interval)
  }, [fetchState])

  if (fetchError) {
    return (
      <div className={styles.centered}>
        <p>{fetchError}</p>
        <button onClick={fetchState}>Zkusit znovu</button>
      </div>
    )
  }
  if (!state) {
    return <div className={styles.centered}>Načítám hru…</div>
  }

  const me = state.players.find((p) => p.userId === currentUserId)
  const others = state.players.filter((p) => p.userId !== currentUserId)
  const currentPlayer = state.players[state.currentPlayerIdx]
  const isMyTurn = currentPlayer?.userId === currentUserId

  // Workers at each location
  const workersByLocation: Record<string, PlayerInfo[]> = {}
  for (const player of state.players) {
    for (const w of player.workers) {
      if (!workersByLocation[w.location]) workersByLocation[w.location] = []
      workersByLocation[w.location].push(player)
    }
  }

  return (
    <div className={styles.board}>

      {/* ── TOP BAR ── */}
      <header className={styles.topBar}>
        <div className={styles.seasonBadge}>
          {SEASON_LABELS[state.season] ?? state.season}
        </div>
        <div className={styles.turnBadge} data-myturn={isMyTurn}>
          {isMyTurn ? "Tvůj tah" : `Na tahu: ${currentPlayer?.username ?? "?"}`}
        </div>
        <div className={styles.deckBadge}>
          Balíček {state.deckSize} · Odložené {state.discardSize}
        </div>
      </header>

      {/* ── OPPONENTS ── */}
      {others.length > 0 && (
        <section className={styles.opponents}>
          {others.map((p) => (
            <div key={p.userId} className={styles.opponentCard}>
              <div
                className={styles.opponentName}
                style={{ borderLeftColor: PLAYER_COLOR_HEX[p.color] ?? "#888" }}
              >
                {p.username}
              </div>
              <Resources {...p} />
              <div className={styles.opponentCity}>
                {p.cityCards.map((cid, i) => {
                  const c = CARDS[cid]
                  return (
                    <div
                      key={i}
                      className={styles.cityPip}
                      style={{ background: c ? CARD_COLOR_HEX[c.color] : "#444" }}
                      title={c?.name ?? cid}
                    />
                  )
                })}
                {p.cityCards.length === 0 && (
                  <span className={styles.dimText}>prázdné město</span>
                )}
              </div>
              <div className={styles.dimText}>{p.handSize} karet v ruce</div>
            </div>
          ))}
        </section>
      )}

      {/* ── BOARD LOCATIONS (where workers go) ── */}
      <section className={styles.locationsSection}>
        <h2 className={styles.sectionTitle}>Herní deska — lokace</h2>
        <div className={styles.locations}>
          {BASIC_LOCATIONS.map((loc) => {
            const workers = workersByLocation[loc.id] ?? []
            return (
              <div key={loc.id} className={styles.location}>
                <div className={styles.locationName}>{loc.label}</div>
                <div className={styles.locationResource}>{loc.resource}</div>
                <div className={styles.locationDesc}>{loc.desc}</div>
                <div className={styles.locationWorkers}>
                  {workers.map((wp, i) => (
                    <span
                      key={i}
                      className={styles.workerToken}
                      style={{ background: PLAYER_COLOR_HEX[wp.color] ?? "#888" }}
                      title={wp.username}
                    />
                  ))}
                  {workers.length === 0 && <span className={styles.dimText}>volno</span>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MEADOW ── */}
      <section className={styles.meadowSection}>
        <h2 className={styles.sectionTitle}>
          Louka ({state.meadow.length} karet)
        </h2>
        <div className={styles.cardRow}>
          {state.meadow.map((cardId, i) => (
            <CardTile key={`meadow-${i}`} cardId={cardId} />
          ))}
          {state.meadow.length === 0 && (
            <span className={styles.dimText}>Louka je prázdná</span>
          )}
        </div>
      </section>

      {/* ── MY AREA ── */}
      {me && (
        <section className={styles.myArea}>
          <h2 className={styles.sectionTitle}>
            Ty · {me.username}
            {isMyTurn && <span className={styles.myTurnBadge}> — na tahu</span>}
          </h2>

          <Resources {...me} />

          {/* My workers */}
          <div className={styles.myWorkers}>
            {Object.entries(workersByLocation)
              .flatMap(([loc, players]) =>
                players
                  .filter((p) => p.userId === currentUserId)
                  .map((_, i) => (
                    <span key={`${loc}-${i}`} className={styles.workerLabel}>
                      🐿️ {BASIC_LOCATIONS.find((l) => l.id === loc)?.label ?? loc}
                    </span>
                  ))
              )}
            {me.workers.length === 0 && (
              <span className={styles.dimText}>Žádní nasazení dělníci</span>
            )}
          </div>

          {/* City */}
          {me.cityCards.length > 0 && (
            <div className={styles.citySection}>
              <h3 className={styles.subTitle}>
                Moje město ({me.cityCards.length}/15)
              </h3>
              <div className={styles.cardRow}>
                {me.cityCards.map((cid, i) => (
                  <CardTile key={`city-${i}`} cardId={cid} />
                ))}
              </div>
            </div>
          )}

          {/* Hand */}
          <div className={styles.handSection}>
            <h3 className={styles.subTitle}>
              Ruka ({state.myHand.length} karet)
            </h3>
            <div className={styles.cardRow}>
              {state.myHand.map((cid, i) => (
                <CardTile key={`hand-${i}`} cardId={cid} showEffect />
              ))}
              {state.myHand.length === 0 && (
                <span className={styles.dimText}>Prázdná ruka</span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
