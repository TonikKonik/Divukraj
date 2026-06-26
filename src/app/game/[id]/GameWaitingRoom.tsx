"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./game.module.css"

const PLAYER_COLORS: Record<string, string> = {
  RED: "var(--p1)",
  BLUE: "var(--p2)",
  GREEN: "var(--p3)",
  ORANGE: "var(--p4)",
}

type GamePlayer = {
  id: string
  color: string
  userId: string
  user: { id: string; username: string }
}

type Game = {
  id: string
  name: string
  status: "LOBBY" | "PLAYING" | "FINISHED"
  maxPlayers: number
  hostId: string
  host: { id: string; username: string }
  players: GamePlayer[]
}

interface Props {
  game: Game
  currentUserId: string
}

export default function GameWaitingRoom({ game, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isHost = game.hostId === currentUserId
  const canStart = isHost && game.players.length >= 2 && game.status === "LOBBY"

  // Polling dokud hra čeká — nahradí Socket.io ve fázi 2
  useEffect(() => {
    if (game.status !== "LOBBY") return
    const interval = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(interval)
  }, [game.status, router])

  async function handleStart() {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/games/${game.id}/start`, { method: "POST" })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const body = await res.json()
      setError(body.error)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>✦ <span>DIVU</span>KRAJ ✦</div>
        <Link href="/lobby" className={styles.backBtn}>← Lobby</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.gameTitle}>{game.name}</div>

          {game.status === "LOBBY" && (
            <>
              <p className={styles.waitingText}>
                {isHost
                  ? `Počkej na hráče a pak spusť hru (${game.players.length}/${game.maxPlayers})`
                  : "Čeká se na hostitele..."}
              </p>

              <div className={styles.playerList}>
                {game.players.map(p => (
                  <div key={p.id} className={styles.playerRow}>
                    <div
                      className={styles.playerDot}
                      style={{ background: PLAYER_COLORS[p.color] }}
                    />
                    <span className={styles.playerName}>
                      {p.user.username}
                      {p.userId === game.hostId ? " 👑" : ""}
                      {p.userId === currentUserId ? " (ty)" : ""}
                    </span>
                  </div>
                ))}
                {Array.from({ length: game.maxPlayers - game.players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className={`${styles.playerRow} ${styles.emptySlot}`}>
                    <div className={styles.playerDotEmpty} />
                    <span>Čeká se na hráče...</span>
                  </div>
                ))}
              </div>

              {error && <p className={styles.error}>{error}</p>}

              {isHost && (
                <button
                  className={styles.startBtn}
                  onClick={handleStart}
                  disabled={!canStart || loading}
                >
                  {loading
                    ? "Spouštím..."
                    : canStart
                    ? "🍀 Spustit hru"
                    : "Potřebuješ alespoň 2 hráče"}
                </button>
              )}
            </>
          )}

          {game.status === "PLAYING" && (
            <div className={styles.playing}>
              <p>🌿 Hra probíhá!</p>
              <p>Herní plocha bude dostupná ve fázi 2 vývoje.</p>
            </div>
          )}

          {game.status === "FINISHED" && (
            <div className={styles.finished}>
              <p>Hra skončila.</p>
              <Link href="/lobby" className={styles.startBtn}>Zpět do lobby</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
