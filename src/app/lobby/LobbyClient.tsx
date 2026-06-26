"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import styles from "./lobby.module.css"

type Player = {
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
  players: Player[]
}

interface Props {
  games: Game[]
  currentUser: { id: string; name: string }
}

const PLAYER_COLORS: Record<string, string> = {
  RED: "var(--p1)",
  BLUE: "var(--p2)",
  GREEN: "var(--p3)",
  ORANGE: "var(--p4)",
}

export default function LobbyClient({ games, currentUser }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [gameName, setGameName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const myGames = games.filter(g => g.players.some(p => p.userId === currentUser.id))
  const otherGames = games.filter(g => !g.players.some(p => p.userId === currentUser.id))

  async function handleCreate() {
    if (!gameName.trim()) return
    setLoading("create")
    setError("")

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: gameName.trim(), maxPlayers }),
    })

    setLoading(null)

    if (res.ok) {
      const game = await res.json()
      router.push(`/game/${game.id}`)
    } else {
      const body = await res.json()
      setError(body.error)
    }
  }

  async function handleJoin(gameId: string) {
    setLoading(gameId)
    setError("")

    const res = await fetch(`/api/games/${gameId}/join`, { method: "POST" })
    setLoading(null)

    if (res.ok) {
      router.push(`/game/${gameId}`)
    } else {
      const body = await res.json()
      setError(body.error)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>✦ <span>DIVU</span>KRAJ ✦</div>
        <div className={styles.headerRight}>
          <span className={styles.userName}>🌿 {currentUser.name}</span>
          <button
            className={styles.logoutBtn}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Odejít z lesa
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          {!creating ? (
            <button className={styles.createBtn} onClick={() => setCreating(true)}>
              🌳 Nová hra
            </button>
          ) : (
            <div className={styles.createForm}>
              <input
                type="text"
                placeholder="Název hry..."
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className={styles.input}
                autoFocus
                maxLength={40}
              />
              <select
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                className={styles.select}
              >
                <option value={2}>2 hráči</option>
                <option value={3}>3 hráči</option>
                <option value={4}>4 hráči</option>
              </select>
              <button
                className={styles.btnGreen}
                onClick={handleCreate}
                disabled={loading === "create" || !gameName.trim()}
              >
                {loading === "create" ? "Vytváří se..." : "Vytvořit"}
              </button>
              <button
                className={styles.btnGhost}
                onClick={() => { setCreating(false); setGameName("") }}
              >
                Zrušit
              </button>
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
        </section>

        {myGames.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Moje hry</h2>
            <div className={styles.grid}>
              {myGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUserId={currentUser.id}
                  onEnter={() => router.push(`/game/${game.id}`)}
                  loading={loading === game.id}
                />
              ))}
            </div>
          </section>
        )}

        {otherGames.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dostupné hry</h2>
            <div className={styles.grid}>
              {otherGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUserId={currentUser.id}
                  onJoin={() => handleJoin(game.id)}
                  loading={loading === game.id}
                />
              ))}
            </div>
          </section>
        )}

        {games.length === 0 && !creating && (
          <div className={styles.empty}>
            <p>🌲 V lese je zatím ticho...</p>
            <p>Vytvoř novou hru a pozvi přátele!</p>
          </div>
        )}
      </main>
    </div>
  )
}

function GameCard({
  game,
  currentUserId,
  onJoin,
  onEnter,
  loading,
}: {
  game: Game
  currentUserId: string
  onJoin?: () => void
  onEnter?: () => void
  loading: boolean
}) {
  const isFull = game.players.length >= game.maxPlayers
  const canJoin = game.status === "LOBBY" && !isFull && !!onJoin
  const isHost = game.hostId === currentUserId

  const statusLabel =
    game.status === "LOBBY" ? "Lobby" :
    game.status === "PLAYING" ? "Probíhá" : "Hotovo"
  const statusColor =
    game.status === "LOBBY" ? "var(--spring)" :
    game.status === "PLAYING" ? "var(--autumn)" : "var(--pebble)"

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameHeader}>
        <span className={styles.gameName}>{game.name}</span>
        <span className={styles.gameStatus} style={{ color: statusColor }}>{statusLabel}</span>
      </div>
      <div className={styles.gameHost}>
        Hostitel: {game.host.username}{isHost ? " (ty)" : ""}
      </div>

      <div className={styles.players}>
        {game.players.map(p => (
          <div
            key={p.id}
            className={styles.playerChip}
            style={{ background: PLAYER_COLORS[p.color] }}
            title={p.user.username}
          >
            {p.user.username[0].toUpperCase()}
          </div>
        ))}
        {Array.from({ length: game.maxPlayers - game.players.length }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.playerChipEmpty} />
        ))}
      </div>
      <div className={styles.playerCount}>{game.players.length} / {game.maxPlayers} hráčů</div>

      <div className={styles.gameActions}>
        {onEnter && (
          <button className={styles.btnGreen} onClick={onEnter} disabled={loading}>
            Vstoupit
          </button>
        )}
        {canJoin && (
          <button className={styles.btnGreen} onClick={onJoin} disabled={loading}>
            {loading ? "Připojuji..." : "Připojit se"}
          </button>
        )}
        {!canJoin && !onEnter && (
          <span className={styles.unavailable}>
            {isFull ? "Hra je plná" : "Hra probíhá"}
          </span>
        )}
      </div>
    </div>
  )
}
