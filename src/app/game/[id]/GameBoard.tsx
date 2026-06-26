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

const BASIC_LOCATIONS = [
  { id: "TWIGS",       label: "Les",    icon: "🌲", gain: "🪵🪵 2 větvičky" },
  { id: "RESIN",       label: "Bažina", icon: "🏔️", gain: "🫧 1 pryskyřice" },
  { id: "PEBBLES",     label: "Jeskyně",icon: "🪨", gain: "🪨 1 kamínek" },
  { id: "BERRIES",     label: "Zahrada",icon: "🌿", gain: "🫐🫐 2 bobule" },
  { id: "CARDS",       label: "Rybník", icon: "🐟", gain: "🃏🃏 2 karty" },
  { id: "CARDS_TWIGS", label: "Keře",   icon: "🌾", gain: "🃏 1 karta + 🪵 1 větvička" },
]

// ── Card component ────────────────────────────────────────────────────────────
function CardTile({
  cardId,
  showEffect = false,
  onClick,
  actionLabel,
  disabled,
  highlight,
}: {
  cardId: string
  showEffect?: boolean
  onClick?: () => void
  actionLabel?: string
  disabled?: boolean
  highlight?: boolean
}) {
  const card = CARDS[cardId]
  const color = card ? CARD_COLOR_HEX[card.color] ?? "#666" : "#555"

  const costParts: string[] = []
  if (card?.cost.twigs)   costParts.push(`🪵${card.cost.twigs}`)
  if (card?.cost.resin)   costParts.push(`🫧${card.cost.resin}`)
  if (card?.cost.pebbles) costParts.push(`🪨${card.cost.pebbles}`)
  if (card?.cost.berries) costParts.push(`🫐${card.cost.berries}`)
  const costStr = card
    ? (costParts.length ? costParts.join(" ") : "Zdarma")
    : "?"

  return (
    <div
      className={`${styles.card} ${highlight ? styles.cardHighlight : ""} ${disabled ? styles.cardDisabled : ""}`}
      style={{ borderColor: color }}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <div className={styles.cardColor} style={{ background: color }} />
      <div className={styles.cardName}>{card?.name ?? cardId}</div>
      {card && (
        <>
          <div className={styles.cardMeta}>
            {card.type === "CRITTER" ? "Obyvatel" : "Stavba"}
            {" · "}
            <span style={{ color }}>{COLOR_LABELS[card.color]}</span>
          </div>
          <div className={styles.cardPoints}>{card.points} VP</div>
          <div className={styles.cardCost}>{costStr}</div>
          {showEffect && <div className={styles.cardEffect}>{card.effectText}</div>}
        </>
      )}
      {onClick && !disabled && actionLabel && (
        <button className={styles.cardBtn}>{actionLabel}</button>
      )}
    </div>
  )
}

// ── Resources display ─────────────────────────────────────────────────────────
function Resources({ twigs, resin, pebbles, berries }: {
  twigs: number; resin: number; pebbles: number; berries: number
}) {
  return (
    <div className={styles.resources}>
      <span title="Větvičky">🪵<b>{twigs}</b></span>
      <span title="Pryskyřice">🫧<b>{resin}</b></span>
      <span title="Kamínky">🪨<b>{pebbles}</b></span>
      <span title="Bobule">🫐<b>{berries}</b></span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GameBoard({
  gameId,
  currentUserId,
}: {
  gameId: string
  currentUserId: string
}) {
  const [state, setState] = useState<GameStateData | null>(null)
  const [fetchError, setFetchError] = useState("")
  const [actionError, setActionError] = useState("")
  const [busy, setBusy] = useState(false)
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null)
  const [selectedMeadowIdx, setSelectedMeadowIdx] = useState<number | null>(null)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/state`)
      if (!res.ok) { setFetchError("Chyba načítání stavu"); return }
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

  const doAction = useCallback(async (body: object) => {
    setBusy(true)
    setActionError("")
    try {
      const res = await fetch(`/api/games/${gameId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error ?? "Chyba akce"); return }
      setSelectedHandIdx(null)
      setSelectedMeadowIdx(null)
      await fetchState()
    } catch {
      setActionError("Síťová chyba")
    } finally {
      setBusy(false)
    }
  }, [gameId, fetchState])

  if (fetchError) return (
    <div className={styles.centered}>
      <p>{fetchError}</p>
      <button onClick={fetchState}>Zkusit znovu</button>
    </div>
  )
  if (!state) return <div className={styles.centered}>Načítám hru…</div>

  const me = state.players.find((p) => p.userId === currentUserId)
  const others = state.players.filter((p) => p.userId !== currentUserId)
  const currentPlayer = state.players[state.currentPlayerIdx]
  const isMyTurn = currentPlayer?.userId === currentUserId

  // Workers by location
  const workersByLoc: Record<string, PlayerInfo[]> = {}
  for (const player of state.players) {
    for (const w of player.workers) {
      workersByLoc[w.location] ??= []
      workersByLoc[w.location].push(player)
    }
  }

  const myDeployed = me?.workers.length ?? 0
  const canDeployWorker = isMyTurn && myDeployed < 2 && !busy

  // Can I afford a card?
  function canAfford(cardId: string): boolean {
    if (!me) return false
    const card = CARDS[cardId]
    if (!card) return false
    const hasPaired = card.pairedWith !== undefined && card.type === "CRITTER" && me.cityCards.includes(card.pairedWith)
    if (hasPaired) return true
    return (
      me.twigs   >= (card.cost.twigs   ?? 0) &&
      me.resin   >= (card.cost.resin   ?? 0) &&
      me.pebbles >= (card.cost.pebbles ?? 0) &&
      me.berries >= (card.cost.berries ?? 0)
    )
  }

  return (
    <div className={styles.board}>

      {/* ── TOP BAR ── */}
      <header className={styles.topBar}>
        <span className={styles.seasonBadge}>{SEASON_LABELS[state.season] ?? state.season}</span>
        <span className={styles.turnBadge} data-myturn={isMyTurn}>
          {isMyTurn ? "Tvůj tah" : `Na tahu: ${currentPlayer?.username ?? "?"}`}
        </span>
        <span className={styles.deckBadge}>Balíček {state.deckSize} · Odložené {state.discardSize}</span>
      </header>

      {/* ── ACTION ERROR ── */}
      {actionError && (
        <div className={styles.actionError}>
          {actionError}
          <button onClick={() => setActionError("")} className={styles.closeBtn}>✕</button>
        </div>
      )}

      {/* ── OPPONENTS ── */}
      {others.length > 0 && (
        <section className={styles.opponents}>
          {others.map((p) => (
            <div key={p.userId} className={styles.opponentCard}>
              <div className={styles.opponentName} style={{ borderLeftColor: PLAYER_COLOR_HEX[p.color] ?? "#888" }}>
                {p.username}
                {currentPlayer?.userId === p.userId && <span className={styles.onTurnDot} />}
              </div>
              <Resources {...p} />
              <div className={styles.opponentCity}>
                {p.cityCards.map((cid, i) => {
                  const c = CARDS[cid]
                  return <div key={i} className={styles.cityPip} style={{ background: c ? CARD_COLOR_HEX[c.color] : "#444" }} title={c?.name ?? cid} />
                })}
                {p.cityCards.length === 0 && <span className={styles.dimText}>prázdné město</span>}
              </div>
              <span className={styles.dimText}>{p.handSize} karet v ruce</span>
            </div>
          ))}
        </section>
      )}

      {/* ── LOCATIONS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Herní deska</h2>
        <div className={styles.locations}>
          {BASIC_LOCATIONS.map((loc) => {
            const workers = workersByLoc[loc.id] ?? []
            const myWorkerHere = workers.some((w) => w.userId === currentUserId)
            const canPlace = canDeployWorker && !myWorkerHere
            return (
              <div
                key={loc.id}
                className={`${styles.location} ${canPlace ? styles.locationActive : ""}`}
                onClick={canPlace ? () => doAction({ type: "DEPLOY_WORKER", location: loc.id }) : undefined}
              >
                <div className={styles.locationIcon}>{loc.icon}</div>
                <div className={styles.locationName}>{loc.label}</div>
                <div className={styles.locationGain}>{loc.gain}</div>
                <div className={styles.locationWorkers}>
                  {workers.map((w, i) => (
                    <span key={i} className={styles.workerDot} style={{ background: PLAYER_COLOR_HEX[w.color] ?? "#888" }} title={w.username} />
                  ))}
                </div>
                {canPlace && <div className={styles.locationCta}>Nasadit 🐿️</div>}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MEADOW ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Louka ({state.meadow.length} karet)</h2>
        <div className={styles.cardRow}>
          {state.meadow.map((cardId, i) => {
            const selected = selectedMeadowIdx === i
            const affordable = canAfford(cardId)
            return (
              <CardTile
                key={`meadow-${i}`}
                cardId={cardId}
                showEffect={selected}
                highlight={selected}
                disabled={!isMyTurn || !affordable || busy}
                onClick={isMyTurn && affordable ? () => {
                  if (selected) {
                    doAction({ type: "PLAY_CARD", cardId, fromMeadow: true, meadowIdx: i })
                  } else {
                    setSelectedHandIdx(null)
                    setSelectedMeadowIdx(i)
                  }
                } : undefined}
                actionLabel={selected ? "Zahrát z Louky" : "Vybrat"}
              />
            )
          })}
        </div>
        {selectedMeadowIdx !== null && (
          <button className={styles.cancelBtn} onClick={() => setSelectedMeadowIdx(null)}>Zrušit výběr</button>
        )}
      </section>

      {/* ── MY AREA ── */}
      {me && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {me.username}
            {isMyTurn && <span className={styles.myTurnTag}> — na tahu</span>}
          </h2>

          <Resources {...me} />

          {/* Action buttons */}
          {isMyTurn && (
            <div className={styles.actionRow}>
              <span className={styles.dimText}>Dělníci: {myDeployed}/2</span>
              <button
                className={styles.seasonBtn}
                onClick={() => doAction({ type: "PREPARE_SEASON" })}
                disabled={busy}
              >
                🍂 Příprava na sezónu
              </button>
            </div>
          )}

          {/* My city */}
          {me.cityCards.length > 0 && (
            <>
              <h3 className={styles.subTitle}>Moje město ({me.cityCards.length}/15)</h3>
              <div className={styles.cardRow}>
                {me.cityCards.map((cid, i) => <CardTile key={`city-${i}`} cardId={cid} />)}
              </div>
            </>
          )}

          {/* Hand */}
          <h3 className={styles.subTitle}>Ruka ({state.myHand.length} karet)</h3>
          <div className={styles.cardRow}>
            {state.myHand.map((cardId, i) => {
              const selected = selectedHandIdx === i
              const affordable = canAfford(cardId)
              return (
                <CardTile
                  key={`hand-${i}`}
                  cardId={cardId}
                  showEffect
                  highlight={selected}
                  disabled={!isMyTurn || !affordable || busy}
                  onClick={isMyTurn && affordable ? () => {
                    if (selected) {
                      doAction({ type: "PLAY_CARD", cardId, fromMeadow: false })
                    } else {
                      setSelectedMeadowIdx(null)
                      setSelectedHandIdx(i)
                    }
                  } : undefined}
                  actionLabel={selected ? "Zahrát" : undefined}
                />
              )
            })}
            {state.myHand.length === 0 && <span className={styles.dimText}>Prázdná ruka</span>}
          </div>
          {selectedHandIdx !== null && (
            <button className={styles.cancelBtn} onClick={() => setSelectedHandIdx(null)}>Zrušit výběr</button>
          )}
        </section>
      )}
    </div>
  )
}
