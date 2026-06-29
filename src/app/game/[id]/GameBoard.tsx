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
  { id: "TWIGS",       label: "Les",     icon: "🌲", gain: "🪵🪵 2 větvičky" },
  { id: "RESIN",       label: "Bažina",  icon: "🏔️", gain: "🫧 1 pryskyřice" },
  { id: "PEBBLES",     label: "Jeskyně", icon: "🪨", gain: "🪨 1 kamínek" },
  { id: "BERRIES",     label: "Zahrada", icon: "🌿", gain: "🫐🫐 2 bobule" },
  { id: "CARDS",       label: "Rybník",  icon: "🐟", gain: "🃏🃏 2 karty" },
  { id: "CARDS_TWIGS", label: "Keře",    icon: "🌾", gain: "🃏 karta + 🪵 větvička" },
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
  const currentPlayer = state.players[state.currentPlayerIdx]
  const isMyTurn = currentPlayer?.userId === currentUserId

  const workersByLoc: Record<string, PlayerInfo[]> = {}
  for (const player of state.players) {
    for (const w of player.workers) {
      workersByLoc[w.location] ??= []
      workersByLoc[w.location].push(player)
    }
  }

  const myDeployed = me?.workers.length ?? 0
  const canDeployWorker = isMyTurn && myDeployed < 2 && !busy

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
    <div className={styles.gamePage}>

      {/* ── TOP BAR ── */}
      <header className={styles.topBar}>
        <span className={styles.gameTitle}>✦ DIVUKRAJ ✦</span>
        <span className={styles.seasonBadge}>{SEASON_LABELS[state.season] ?? state.season}</span>
        <span className={styles.turnBadge} data-myturn={isMyTurn}>
          {isMyTurn ? "✦ Tvůj tah" : `Na tahu: ${currentPlayer?.username ?? "?"}`}
        </span>
        <span className={styles.deckBadge}>Balíček {state.deckSize} · Odložené {state.discardSize}</span>
      </header>

      {actionError && (
        <div className={styles.actionError}>
          {actionError}
          <button onClick={() => setActionError("")} className={styles.closeBtn}>✕</button>
        </div>
      )}

      <div className={styles.gameLayout}>

        {/* ── SIDEBAR PANEL (sidebar.png) ── */}
        <aside className={styles.sidePanel}>

          {/* PŘEHLED HRÁČŮ — overlaid on PNG player rows */}
          <div className={styles.sidePlayersArea}>
            {state.players.map((p) => {
              const isCurrentP = currentPlayer?.userId === p.userId
              const isMe = p.userId === currentUserId
              const handCount = isMe ? state.myHand.length : (p.handSize ?? 0)
              return (
                <div
                  key={p.userId}
                  className={`${styles.sidePlayer} ${isCurrentP ? styles.sidePlayerActive : ""}`}
                >
                  <div
                    className={styles.sideAvatar}
                    style={{
                      borderColor: PLAYER_COLOR_HEX[p.color] ?? "#888",
                      background: (PLAYER_COLOR_HEX[p.color] ?? "#888") + "33",
                    }}
                  />
                  <div className={styles.sidePlayerInfo}>
                    <div className={styles.sidePlayerName}>
                      {p.username}{isMe ? " ★" : ""}{isCurrentP ? " ←" : ""}
                    </div>
                    <div className={styles.sidePlayerRes}>
                      🪵{p.twigs} 🫧{p.resin} 🪨{p.pebbles} 🫐{p.berries}
                    </div>
                    <div className={styles.sidePlayerMini}>
                      🃏{handCount} &nbsp;🏘️{p.cityCards.length}/15 &nbsp;👷{p.workers.length}/2
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Empty slots for up to 4 players */}
            {Array.from({ length: Math.max(0, 4 - state.players.length) }, (_, i) => (
              <div key={`empty-${i}`} className={styles.sidePlayerEmpty} />
            ))}
          </div>

          {/* STAV HRY */}
          <div className={styles.sideStatusArea}>
            <div className={styles.sideStatusRow}>
              Sezóna: <strong>{SEASON_LABELS[state.season]}</strong>
            </div>
            <div className={styles.sideStatusRow}>
              Na tahu: <strong>{isMyTurn ? "Ty" : currentPlayer?.username ?? "?"}</strong>
            </div>
            {me && (
              <div className={styles.sideStatusRow}>
                Dělníci: <strong>{myDeployed}/2</strong>
              </div>
            )}
          </div>

          {/* POSLEDNÍ AKCE */}
          <div className={styles.sideLogArea}>
            <div className={styles.logPlaceholder}>— zatím bez logu akcí —</div>
          </div>

          {/* RYCHLÉ AKCE */}
          <div className={styles.sideActionsArea}>
            {isMyTurn && (
              <button
                className={styles.seasonBtn}
                onClick={() => doAction({ type: "PREPARE_SEASON" })}
                disabled={busy}
              >
                🍂 Příchod sezóny
              </button>
            )}
            {(selectedMeadowIdx !== null || selectedHandIdx !== null) && (
              <button
                className={styles.cancelBtn}
                onClick={() => { setSelectedMeadowIdx(null); setSelectedHandIdx(null) }}
              >
                Zrušit výběr
              </button>
            )}
          </div>

        </aside>

        {/* ── RIGHT AREA ── */}
        <div className={styles.rightArea}>

          {/* ── BOARD PANEL (board.png) ── */}
          <div className={styles.boardPanel}>

            {/* LEFT: Basic locations — overlaid on resource pill area */}
            <div className={styles.boardLocsArea}>
              {BASIC_LOCATIONS.map((loc) => {
                const workers = workersByLoc[loc.id] ?? []
                const myWorkerHere = workers.some((w) => w.userId === currentUserId)
                const canPlace = canDeployWorker && !myWorkerHere
                return (
                  <div
                    key={loc.id}
                    className={`${styles.locSlot} ${canPlace ? styles.locSlotActive : ""}`}
                    onClick={canPlace ? () => doAction({ type: "DEPLOY_WORKER", location: loc.id }) : undefined}
                  >
                    <span className={styles.locIcon}>{loc.icon}</span>
                    <div className={styles.locInfo}>
                      <div className={styles.locName}>{loc.label}</div>
                      <div className={styles.locGain}>{loc.gain}</div>
                    </div>
                    <div className={styles.locWorkers}>
                      {workers.map((w, i) => (
                        <span
                          key={i}
                          className={styles.workerDot}
                          style={{ background: PLAYER_COLOR_HEX[w.color] ?? "#888" }}
                          title={w.username}
                        />
                      ))}
                      {canPlace && <span className={styles.workerEmpty}>◎</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CENTER: MEADOW — 8 card slots */}
            <div className={styles.meadowArea}>
              <div className={styles.meadowLabel}>🌸 Louka ({state.meadow.length}/8)</div>
              <div className={styles.meadowGrid}>
                {Array.from({ length: 8 }, (_, i) => {
                  const cardId = state.meadow[i]
                  if (!cardId) return <div key={i} className={styles.emptySlot} />
                  const selected = selectedMeadowIdx === i
                  const affordable = canAfford(cardId)
                  return (
                    <CardTile
                      key={`m${i}`}
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
                <button className={styles.cancelBtn} onClick={() => setSelectedMeadowIdx(null)}>
                  Zrušit výběr
                </button>
              )}
            </div>

            {/* RIGHT: Player overview / special events */}
            <div className={styles.boardRightArea}>
              <div className={styles.boardRightLabel}>Mimořádné události</div>
              <div className={styles.eventSlots}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.eventSlot}>
                    <span className={styles.dimText}>—</span>
                  </div>
                ))}
              </div>
              <div className={styles.boardScores}>
                {state.players.map((p) => (
                  <div key={p.userId} className={styles.scoreRow}>
                    <span
                      className={styles.scoreDot}
                      style={{ background: PLAYER_COLOR_HEX[p.color] ?? "#888" }}
                    />
                    <span className={styles.scoreName}>{p.username}</span>
                    <span className={styles.scoreVal}>🏘️{p.cityCards.length}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* /boardPanel */}

          {/* ── PLAYER PANEL (player.png) ── */}
          <div className={styles.playerPanel}>

            {/* HAND (top-left) */}
            <div className={styles.handArea}>
              <div className={styles.handLabel}>🃏 Karty na ruce ({state.myHand.length}/8)</div>
              <div className={styles.handCards}>
                {state.myHand.map((cardId, i) => {
                  const selected = selectedHandIdx === i
                  const affordable = canAfford(cardId)
                  return (
                    <div key={`h${i}`} className={styles.handCardWrap}>
                      <CardTile
                        cardId={cardId}
                        showEffect={selected}
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
                    </div>
                  )
                })}
                {state.myHand.length === 0 && (
                  <span className={styles.dimText}>Prázdná ruka</span>
                )}
              </div>
              {selectedHandIdx !== null && (
                <button className={styles.cancelBtn} onClick={() => setSelectedHandIdx(null)}>
                  Zrušit výběr
                </button>
              )}
            </div>

            {/* CITY (center) */}
            {me && (
              <div className={styles.cityArea}>
                <div className={styles.cityLabel}>🏘️ Vyložené karty ({me.cityCards.length}/15)</div>
                <div className={styles.cityGrid}>
                  {me.cityCards.map((cid, i) => (
                    <CardTile key={`c${i}`} cardId={cid} showEffect />
                  ))}
                  {me.cityCards.length === 0 && (
                    <span className={styles.dimText}>Prázdné město</span>
                  )}
                </div>
              </div>
            )}

            {/* RESOURCES (right column) */}
            {me && (
              <div className={styles.resourcesArea}>
                <div className={styles.resTitle}>Suroviny</div>
                <Resources twigs={me.twigs} resin={me.resin} pebbles={me.pebbles} berries={me.berries} />
                {isMyTurn && (
                  <button
                    className={`${styles.seasonBtn} ${styles.seasonBtnCompact}`}
                    onClick={() => doAction({ type: "PREPARE_SEASON" })}
                    disabled={busy}
                  >
                    🍂 Sezóna
                  </button>
                )}
              </div>
            )}

          </div>{/* /playerPanel */}

        </div>{/* /rightArea */}

      </div>{/* /gameLayout */}

    </div>
  )
}
