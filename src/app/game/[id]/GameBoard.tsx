"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCard, CARDS, COLOR_LABELS } from "@/lib/cards"
import styles from "./GameBoard.module.css"

interface Worker { location: string; season: string }

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

const COLOR_CSS: Record<string, string> = {
  RED: "#c62828",
  BLUE: "#1565c0",
  GREEN: "#2e7d32",
  ORANGE: "#e65100",
}

const CARD_COLOR_CSS: Record<string, string> = {
  GREEN: "#2e7d32",
  RED: "#c62828",
  BLUE: "#1565c0",
  TAN: "#8d6e63",
  PURPLE: "#6a1b9a",
}

export default function GameBoard({
  gameId,
  currentUserId,
}: {
  gameId: string
  currentUserId: string
}) {
  const router = useRouter()
  const [state, setState] = useState<GameStateData | null>(null)
  const [error, setError] = useState("")
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}/state`)
    if (!res.ok) { setError("Chyba načítání stavu hry"); return }
    const data = await res.json()
    setState(data)
  }, [gameId])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 3000)
    return () => clearInterval(interval)
  }, [fetchState])

  if (error) return <div className={styles.error}>{error}</div>
  if (!state) return <div className={styles.loading}>Načítám hru...</div>

  const me = state.players.find((p) => p.userId === currentUserId)
  const others = state.players.filter((p) => p.userId !== currentUserId)
  const currentPlayer = state.players[state.currentPlayerIdx]
  const isMyTurn = currentPlayer?.userId === currentUserId

  return (
    <div className={styles.board}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.season}>
          <span className={styles.seasonLabel}>{SEASON_LABELS[state.season] ?? state.season}</span>
        </div>
        <div className={styles.turnInfo}>
          {isMyTurn
            ? "Je tvůj tah"
            : `Hraje: ${currentPlayer?.username ?? "?"}`}
        </div>
        <div className={styles.deckInfo}>
          Balíček: {state.deckSize} | Odloženích: {state.discardSize}
        </div>
      </header>

      {/* Opponents */}
      {others.map((player) => (
        <div key={player.userId} className={styles.opponentRow}>
          <div className={styles.playerName} style={{ color: COLOR_CSS[player.color] }}>
            {player.username}
          </div>
          <div className={styles.resources}>
            <span title="Větvičky">🪵 {player.twigs}</span>
            <span title="Pryskyřice">🫧 {player.resin}</span>
            <span title="Kamínky">🪨 {player.pebbles}</span>
            <span title="Bobule">🫐 {player.berries}</span>
          </div>
          <div className={styles.handCount}>Ruka: {player.handSize ?? 0} karet</div>
          <div className={styles.cityMini}>
            {player.cityCards.map((cardId, i) => {
              const card = CARDS[cardId]
              return (
                <div
                  key={i}
                  className={styles.cityCardMini}
                  style={{ borderColor: card ? CARD_COLOR_CSS[card.color] : "#666" }}
                  title={card?.name ?? cardId}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* Meadow */}
      <section className={styles.meadow}>
        <h2 className={styles.sectionTitle}>Louka</h2>
        <div className={styles.meadowCards}>
          {state.meadow.map((cardId, i) => {
            const card = CARDS[cardId]
            if (!card) return null
            return (
              <div
                key={i}
                className={styles.card}
                style={{ borderColor: CARD_COLOR_CSS[card.color] }}
                onClick={() => setSelectedCard(selectedCard === cardId + i ? null : cardId + i)}
              >
                <div className={styles.cardColor} style={{ background: CARD_COLOR_CSS[card.color] }} />
                <div className={styles.cardName}>{card.name}</div>
                <div className={styles.cardType}>{card.type === "CRITTER" ? "Obyvatel" : "Stavba"}</div>
                <div className={styles.cardPoints}>{card.points} bodů</div>
                <div className={styles.cardCost}>
                  {card.cost.twigs ? `🪵${card.cost.twigs} ` : ""}
                  {card.cost.resin ? `🫧${card.cost.resin} ` : ""}
                  {card.cost.pebbles ? `🪨${card.cost.pebbles} ` : ""}
                  {card.cost.berries ? `🫐${card.cost.berries}` : ""}
                  {!card.cost.twigs && !card.cost.resin && !card.cost.pebbles && !card.cost.berries ? "Zdarma" : ""}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* My area */}
      {me && (
        <section className={styles.myArea}>
          {/* Resources */}
          <div className={styles.myResources}>
            <span className={styles.resource} title="Větvičky">🪵 <b>{me.twigs}</b></span>
            <span className={styles.resource} title="Pryskyřice">🫧 <b>{me.resin}</b></span>
            <span className={styles.resource} title="Kamínky">🪨 <b>{me.pebbles}</b></span>
            <span className={styles.resource} title="Bobule">🫐 <b>{me.berries}</b></span>
          </div>

          {/* My city */}
          {me.cityCards.length > 0 && (
            <div className={styles.myCity}>
              <h3 className={styles.sectionTitle}>Moje město ({me.cityCards.length}/15)</h3>
              <div className={styles.cityCards}>
                {me.cityCards.map((cardId, i) => {
                  const card = CARDS[cardId]
                  if (!card) return null
                  return (
                    <div key={i} className={styles.cityCard} style={{ borderColor: CARD_COLOR_CSS[card.color] }}>
                      <div className={styles.cardColor} style={{ background: CARD_COLOR_CSS[card.color] }} />
                      <div className={styles.cardName}>{card.name}</div>
                      <div className={styles.cardPoints}>{card.points} bodů</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* My hand */}
          <div className={styles.myHand}>
            <h3 className={styles.sectionTitle}>Moje ruka ({state.myHand.length} karet)</h3>
            <div className={styles.handCards}>
              {state.myHand.map((cardId, i) => {
                const card = CARDS[cardId]
                if (!card) return null
                return (
                  <div
                    key={i}
                    className={`${styles.card} ${styles.handCard}`}
                    style={{ borderColor: CARD_COLOR_CSS[card.color] }}
                  >
                    <div className={styles.cardColor} style={{ background: CARD_COLOR_CSS[card.color] }} />
                    <div className={styles.cardName}>{card.name}</div>
                    <div className={styles.cardType}>{card.type === "CRITTER" ? "Obyvatel" : "Stavba"}</div>
                    <div className={styles.cardPoints}>{card.points} bodů</div>
                    <div className={styles.cardCost}>
                      {card.cost.twigs ? `🪵${card.cost.twigs} ` : ""}
                      {card.cost.resin ? `🫧${card.cost.resin} ` : ""}
                      {card.cost.pebbles ? `🪨${card.cost.pebbles} ` : ""}
                      {card.cost.berries ? `🫐${card.cost.berries}` : ""}
                      {!card.cost.twigs && !card.cost.resin && !card.cost.pebbles && !card.cost.berries ? "Zdarma" : ""}
                    </div>
                    <div className={styles.cardEffect}>{card.effectText}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
