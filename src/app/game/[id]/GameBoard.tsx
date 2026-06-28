"use client"

import { useEffect, useState, useCallback } from "react"
import { CARDS } from "@/lib/cards"
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
  SPRING: "Jaro", SUMMER: "Léto", AUTUMN: "Podzim", WINTER: "Zima",
}
const SEASON_ABBR: Record<string, string> = {
  SPRING: "JA", SUMMER: "LÉ", AUTUMN: "PO", WINTER: "ZI",
}
const SEASON_ORDER = ["SPRING", "SUMMER", "AUTUMN", "WINTER"] as const

const PLAYER_COLOR_HEX: Record<string, string> = {
  RED: "#c62828", BLUE: "#1565c0", BROWN: "#6d4c41", WHITE: "#e0d8cc",
  GREEN: "#2e7d32", ORANGE: "#e65100",
}

const SEASON_PIP_CLASS: Record<string, string> = {
  SPRING: styles.seasonSpring,
  SUMMER: styles.seasonSummer,
  AUTUMN: styles.seasonAutumn,
  WINTER: styles.seasonWinter,
}

const BRANCH_LABEL_CLASS: Record<string, string> = {
  AUTUMN: styles.blAutumn,
  SUMMER: styles.blSummer,
  SPRING: styles.blSpring,
}

type ResType = "twigs" | "resin" | "pebbles" | "berries"
type RewardItem = { type: ResType | "cards"; count: number }

const PIP_CFG: Record<ResType, { bg: string; letter: string; title: string }> = {
  twigs:   { bg: "#6b3510", letter: "╲", title: "Větvičky" },   // dřívko
  resin:   { bg: "#c07800", letter: "◆", title: "Smůla" },      // krystal
  pebbles: { bg: "#4d5c6c", letter: "●", title: "Oblázky" },    // kámen
  berries: { bg: "#701fa0", letter: "✿", title: "Bobule" },     // bobule
}

const CARD_STRIPE_CLASS: Record<string, string> = {
  GREEN: styles.cardStripeGREEN, RED: styles.cardStripeRED,
  BLUE: styles.cardStripeBLUE, TAN: styles.cardStripeTAN, PURPLE: styles.cardStripePURPLE,
}
const CARD_ART_CLASS: Record<string, string> = {
  GREEN: styles.cardArtGREEN, RED: styles.cardArtRED,
  BLUE: styles.cardArtBLUE, TAN: styles.cardArtTAN, PURPLE: styles.cardArtPURPLE,
}
const CARD_ART_EMOJI: Record<string, Record<string, string>> = {
  CRITTER:      { GREEN: "🐸", RED: "🦡", BLUE: "🦉", TAN: "🐰", PURPLE: "🦅" },
  CONSTRUCTION: { GREEN: "🌾", RED: "🏠", BLUE: "🏛️", TAN: "🛒", PURPLE: "🏰" },
}
const CARD_BADGE_CLASS: Record<string, string> = {
  GREEN: styles.badgeGREEN, RED: styles.badgeRED,
  BLUE: styles.badgeBLUE, TAN: styles.badgeTAN, PURPLE: styles.badgePURPLE,
}
const CARD_TYPE_ICON: Record<string, string> = {
  GREEN: "🌿", RED: "🐾", BLUE: "📜", TAN: "🦋", PURPLE: "🌸",
}
const CARD_HEADER_CLASS: Record<string, string> = {
  GREEN: styles.headerGREEN, RED: styles.headerRED,
  BLUE: styles.headerBLUE, TAN: styles.headerTAN, PURPLE: styles.headerPURPLE,
}

const BASIC_LOCATIONS: Array<{ id: string; label: string; rewards: RewardItem[] }> = [
  { id: "TWIGS",       label: "Výrubisko",  rewards: [{ type: "twigs",   count: 2 }] },
  { id: "RESIN",       label: "Kůrovník",   rewards: [{ type: "resin",   count: 1 }] },
  { id: "PEBBLES",     label: "Žulový lom", rewards: [{ type: "pebbles", count: 1 }] },
  { id: "BERRIES",     label: "Borůvčí",    rewards: [{ type: "berries", count: 2 }] },
  { id: "CARDS",       label: "Rybník",     rewards: [{ type: "cards",   count: 2 }] },
  { id: "CARDS_TWIGS", label: "Pěstitelé",  rewards: [{ type: "cards",   count: 1 }, { type: "twigs", count: 1 }] },
]

// ── Pip ──────────────────────────────────────────────────────────────────────
function Pip({ type, size = "sm" }: { type: ResType; size?: "sm" | "md" }) {
  const c = PIP_CFG[type]
  return (
    <span
      className={size === "md" ? styles.pipMd : styles.pipSm}
      style={{ background: c.bg }}
      title={c.title}
    >
      {c.letter}
    </span>
  )
}

function RewardPips({ rewards }: { rewards: RewardItem[] }) {
  return (
    <div className={styles.rewardPips}>
      {rewards.flatMap((r, i) =>
        r.type === "cards"
          ? Array.from({ length: r.count }, (_, j) => (
              <span key={`c${i}${j}`} className={styles.cardPipIcon}>🃏</span>
            ))
          : Array.from({ length: r.count }, (_, j) => (
              <Pip key={`r${i}${j}`} type={r.type as ResType} />
            ))
      )}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
function CardTile({
  cardId, showEffect = false, onClick, actionLabel, disabled, highlight,
}: {
  cardId: string
  showEffect?: boolean
  onClick?: () => void
  actionLabel?: string
  disabled?: boolean
  highlight?: boolean
}) {
  const card = CARDS[cardId]
  const isCritter = card?.type === "CRITTER"
  const hasCost = card && (card.cost.twigs || card.cost.resin || card.cost.pebbles || card.cost.berries)

  const cls = [
    styles.card,
    isCritter ? styles.cardCritter : styles.cardConstruction,
    highlight ? styles.cardSelected : "",
    disabled ? styles.cardDisabled : "",
  ].filter(Boolean).join(" ")

  return (
    <div className={cls} onClick={!disabled && onClick ? onClick : undefined}>
      {/* Tenký barevný proužek nahoře */}
      {card && <div className={`${styles.cardStripe} ${CARD_STRIPE_CLASS[card.color] ?? ""}`} />}

      {/* Banner s názvem karty — barevný dle funkčního typu */}
      <div className={`${styles.cardHeader} ${card ? (CARD_HEADER_CLASS[card.color] ?? "") : ""}`}>
        <span className={styles.cardName}>{card?.name ?? cardId}</span>
      </div>

      {/* Ilustrace — s overlayem ceny (vlevo nahoře), odznaku (vpravo nahoře), VP (vpravo dole) */}
      <div className={`${styles.cardArt} ${card ? (CARD_ART_CLASS[card.color] ?? "") : ""}`}>
        {/* Cena — vlevo nahoře */}
        <div className={styles.costOverlay}>
          {card && Array.from({ length: card.cost.twigs   ?? 0 }, (_, i) => <Pip key={`t${i}`} type="twigs"   />)}
          {card && Array.from({ length: card.cost.resin   ?? 0 }, (_, i) => <Pip key={`r${i}`} type="resin"   />)}
          {card && Array.from({ length: card.cost.pebbles ?? 0 }, (_, i) => <Pip key={`p${i}`} type="pebbles" />)}
          {card && Array.from({ length: card.cost.berries ?? 0 }, (_, i) => <Pip key={`b${i}`} type="berries" />)}
          {card && !hasCost && <span className={styles.pipFree}>✦</span>}
        </div>
        {/* Odznak funkčního typu — vpravo nahoře */}
        {card && (
          <span className={`${styles.cardTypeBadge} ${CARD_BADGE_CLASS[card.color] ?? ""}`}>
            {CARD_TYPE_ICON[card.color] ?? ""}
          </span>
        )}
        {/* Emoji ilustrace — střed */}
        <span className={styles.artEmoji}>
          {card ? (CARD_ART_EMOJI[card.type]?.[card.color] ?? "?") : "?"}
        </span>
        {/* VP kolečko — vpravo dole */}
        {card && <div className={styles.vpCircle}>{card.points}</div>}
      </div>

      {/* Podtyp + spárování */}
      {card && (
        <div className={styles.cardSubtypeRow}>
          <span className={styles.cardSubtype}>
            {card.unique ? "jedinečný" : "běžný"} {isCritter ? "tvor" : "stavba"}
          </span>
          {isCritter && card.pairedWith && (
            <span className={styles.pairedHint} title={`Spárováno se stavbou ${card.pairedWith}`}>🏚</span>
          )}
        </div>
      )}

      {/* Efektový text */}
      {card && showEffect && (
        <div className={styles.cardFx}>{card.effectText}</div>
      )}

      {actionLabel && onClick && !disabled && (
        <div className={styles.cardActionOverlay}>{actionLabel}</div>
      )}
    </div>
  )
}

// ── Board SVG Illustration ───────────────────────────────────────────────────
function BoardIllustration() {
  return (
    <svg
      className={styles.boardIllustration}
      viewBox="0 0 1200 380"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="biBoardBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8a860" />
          <stop offset="100%" stopColor="#a88040" />
        </linearGradient>
        <linearGradient id="biForest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c3c12" />
          <stop offset="100%" stopColor="#0c2008" />
        </linearGradient>
        <linearGradient id="biMeadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a6828" />
          <stop offset="100%" stopColor="#2a5018" />
        </linearGradient>
        <linearGradient id="biRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3e5a" />
          <stop offset="100%" stopColor="#0e2030" />
        </linearGradient>
      </defs>

      {/* Board base: parchment */}
      <rect width="1200" height="380" rx="14" fill="url(#biBoardBg)" />

      {/* Prastrom forest zone (left) */}
      <rect x="0" y="0" width="244" height="380" rx="14" fill="url(#biForest)" />
      <rect x="230" y="0" width="14" height="380" fill="url(#biForest)" />

      {/* Meadow zone (top right) */}
      <rect x="244" y="0" width="956" height="240" fill="url(#biMeadow)" />

      {/* River/locations zone (bottom right) */}
      <rect x="244" y="240" width="956" height="140" fill="url(#biRiver)" />

      {/* Meadow–river separator */}
      <path d="M 248 240 L 1196 240" stroke="#3a6418" strokeWidth="2" strokeOpacity="0.45" />

      {/* River water shimmer */}
      <path d="M 270 262 C 440 252, 600 274, 760 260 C 900 247, 1060 270, 1185 258"
            stroke="#4a8ab8" strokeWidth="7" fill="none" strokeOpacity="0.22" strokeLinecap="round" />
      <path d="M 285 290 C 450 280, 610 298, 770 284 C 910 271, 1070 292, 1185 282"
            stroke="#4a8ab8" strokeWidth="4" fill="none" strokeOpacity="0.15" strokeLinecap="round" />
      <path d="M 300 318 C 460 309, 620 326, 780 313 C 930 300, 1080 318, 1185 310"
            stroke="#4a8ab8" strokeWidth="3" fill="none" strokeOpacity="0.1" strokeLinecap="round" />

      {/* Forest zone separator */}
      <path d="M 241 8 L 241 372" stroke="#5a3a10" strokeWidth="2" strokeOpacity="0.38" />

      {/* Ever Tree trunk */}
      <rect x="112" y="216" width="18" height="96" rx="4" fill="#6a4018" />
      {/* Ever Tree crown – layered circles */}
      <circle cx="121" cy="210" r="72" fill="#122e0e" />
      <circle cx="121" cy="183" r="59" fill="#1a3e14" />
      <circle cx="121" cy="160" r="47" fill="#244e1c" />
      <circle cx="121" cy="140" r="35" fill="#2e5e22" />
      <circle cx="121" cy="123" r="23" fill="#386e28" />
      <circle cx="121" cy="110" r="13" fill="#427e2e" />
      {/* Tree highlight */}
      <circle cx="108" cy="100" r="7" fill="#5a9a40" fillOpacity="0.3" />

      {/* Roots */}
      <path d="M 106 312 C 68 334, 44 356, 34 376" stroke="#4a2c08" strokeWidth="6" fill="none" strokeOpacity="0.48" strokeLinecap="round" />
      <path d="M 121 314 C 114 346, 110 362, 108 377" stroke="#4a2c08" strokeWidth="5" fill="none" strokeOpacity="0.42" strokeLinecap="round" />
      <path d="M 137 312 C 164 334, 178 357, 182 376" stroke="#4a2c08" strokeWidth="6" fill="none" strokeOpacity="0.48" strokeLinecap="round" />

      {/* Smaller trees – Prastrom zone */}
      <rect x="36" y="318" width="8" height="34" rx="2" fill="#6a4018" fillOpacity="0.6" />
      <circle cx="40" cy="316" r="24" fill="#162e0e" fillOpacity="0.55" />
      <circle cx="40" cy="302" r="18" fill="#1e3e14" fillOpacity="0.55" />

      <rect x="188" y="324" width="7" height="28" rx="2" fill="#6a4018" fillOpacity="0.45" />
      <circle cx="192" cy="323" r="18" fill="#162e0e" fillOpacity="0.4" />
      <circle cx="192" cy="312" r="13" fill="#1e3e14" fillOpacity="0.4" />

      {/* Mushroom in forest zone */}
      <rect x="58" y="246" width="6" height="14" rx="1" fill="#d4c090" fillOpacity="0.32" />
      <ellipse cx="61" cy="245" rx="13" ry="7" fill="#c04030" fillOpacity="0.38" />
      <ellipse cx="56" cy="243" rx="4" ry="2.5" fill="#f06050" fillOpacity="0.28" />

      {/* Vine on divider */}
      <path d="M 238 30 C 244 55, 234 80, 242 108 C 250 136, 236 162, 242 190"
            stroke="#3a6820" strokeWidth="2" fill="none" strokeOpacity="0.38" />

      {/* Meadow flowers */}
      <circle cx="340" cy="88" r="6" fill="#f0e050" fillOpacity="0.42" />
      <circle cx="340" cy="88" r="3" fill="#c8a820" fillOpacity="0.5" />
      <circle cx="490" cy="148" r="6" fill="#f0a060" fillOpacity="0.38" />
      <circle cx="490" cy="148" r="3" fill="#c87030" fillOpacity="0.45" />
      <circle cx="690" cy="68" r="5" fill="#f0e050" fillOpacity="0.36" />
      <circle cx="690" cy="68" r="2.5" fill="#c8a820" fillOpacity="0.4" />
      <circle cx="840" cy="136" r="6" fill="#f080c0" fillOpacity="0.32" />
      <circle cx="840" cy="136" r="3" fill="#c05090" fillOpacity="0.38" />
      <circle cx="1010" cy="98" r="5" fill="#f0e050" fillOpacity="0.3" />
      <circle cx="1110" cy="158" r="6" fill="#f0a060" fillOpacity="0.28" />

      {/* Meadow grass tufts at meadow bottom edge */}
      <path d="M 325 234 L 323 220 M 331 235 L 332 221 M 337 234 L 336 222"
            stroke="#4a7830" strokeWidth="2" fill="none" strokeOpacity="0.38" />
      <path d="M 614 236 L 612 222 M 620 237 L 621 223 M 626 236 L 625 224"
            stroke="#4a7830" strokeWidth="2" fill="none" strokeOpacity="0.32" />
      <path d="M 912 235 L 910 221 M 918 236 L 919 222 M 924 235 L 923 223"
            stroke="#4a7830" strokeWidth="2" fill="none" strokeOpacity="0.28" />

      {/* River stones */}
      <ellipse cx="410" cy="334" rx="10" ry="5" fill="#788a92" fillOpacity="0.26" />
      <ellipse cx="650" cy="352" rx="8" ry="4.5" fill="#788a92" fillOpacity="0.2" />
      <ellipse cx="880" cy="330" rx="11" ry="5.5" fill="#788a92" fillOpacity="0.2" />
      <ellipse cx="1100" cy="348" rx="9" ry="5" fill="#788a92" fillOpacity="0.18" />

      {/* Board outer border */}
      <rect x="2" y="2" width="1196" height="376" rx="13" fill="none" stroke="#7a5010" strokeWidth="5" strokeOpacity="0.72" />
      <rect x="7" y="7" width="1186" height="366" rx="10" fill="none" stroke="#d8a848" strokeWidth="1.5" strokeOpacity="0.25" />
    </svg>
  )
}

// ── ResBar ────────────────────────────────────────────────────────────────────
function ResBar({ twigs, resin, pebbles, berries }: {
  twigs: number; resin: number; pebbles: number; berries: number
}) {
  return (
    <div className={styles.resBar}>
      <div className={styles.resBarItem}><Pip type="twigs"   size="md" /><strong>{twigs}</strong></div>
      <div className={styles.resBarItem}><Pip type="resin"   size="md" /><strong>{resin}</strong></div>
      <div className={styles.resBarItem}><Pip type="pebbles" size="md" /><strong>{pebbles}</strong></div>
      <div className={styles.resBarItem}><Pip type="berries" size="md" /><strong>{berries}</strong></div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
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
      setState(await res.json())
      setFetchError("")
    } catch { setFetchError("Síťová chyba") }
  }, [gameId])

  useEffect(() => {
    fetchState()
    const iv = setInterval(fetchState, 3000)
    return () => clearInterval(iv)
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
    } catch { setActionError("Síťová chyba") }
    finally { setBusy(false) }
  }, [gameId, fetchState])

  if (fetchError) return (
    <div className={styles.centered}>
      <p>{fetchError}</p>
      <button onClick={fetchState}>Zkusit znovu</button>
    </div>
  )
  if (!state) return <div className={styles.centered}>Načítám hru…</div>

  const me = state.players.find(p => p.userId === currentUserId)
  const currentPlayer = state.players[state.currentPlayerIdx]
  const isMyTurn = currentPlayer?.userId === currentUserId
  const myDeployed = me?.workers.length ?? 0
  const curSeasonIdx = SEASON_ORDER.indexOf(state.season as typeof SEASON_ORDER[number])

  const workersByLoc: Record<string, PlayerInfo[]> = {}
  for (const player of state.players) {
    for (const w of player.workers) {
      workersByLoc[w.location] ??= []
      workersByLoc[w.location].push(player)
    }
  }

  function canPlaceAt(locId: string): boolean {
    if (!isMyTurn || busy || myDeployed >= 2) return false
    return !(workersByLoc[locId] ?? []).some(w => w.userId === currentUserId)
  }

  function canAfford(cardId: string): boolean {
    if (!me) return false
    const card = CARDS[cardId]
    if (!card) return false
    if (card.pairedWith !== undefined && card.type === "CRITTER" && me.cityCards.includes(card.pairedWith)) return true
    return (
      me.twigs   >= (card.cost.twigs   ?? 0) &&
      me.resin   >= (card.cost.resin   ?? 0) &&
      me.pebbles >= (card.cost.pebbles ?? 0) &&
      me.berries >= (card.cost.berries ?? 0)
    )
  }

  return (
    <div className={styles.board}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.gameTitle}>✦ <span>DIVU</span>KRAJ ✦</div>

        <div className={styles.seasonTrack}>
          {SEASON_ORDER.map((s, i) => (
            <div
              key={s}
              className={[
                styles.seasonPip,
                SEASON_PIP_CLASS[s],
                i < curSeasonIdx ? styles.seasonDone : "",
                i === curSeasonIdx ? styles.seasonActive : "",
              ].filter(Boolean).join(" ")}
            >
              {SEASON_ABBR[s]}
            </div>
          ))}
          <span className={styles.seasonLabel}>▸ {SEASON_LABELS[state.season]}</span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.onTurn}>
            {isMyTurn ? "✦ Tvůj tah" : `Na tahu: ${currentPlayer?.username ?? "?"}`}
          </div>
          <div className={styles.deckInfo}>
            Balíček {state.deckSize} · Odložené {state.discardSize}
          </div>
        </div>
      </header>

      {/* ── ACTION ERROR ── */}
      {actionError && (
        <div className={styles.actionError}>
          {actionError}
          <button onClick={() => setActionError("")} className={styles.closeBtn}>✕</button>
        </div>
      )}

      <div className={styles.gameWrap}>

        {/* ── HERNÍ DESKA (fyzická deska hry na stole) ── */}
        <div className={styles.herniDeska}>
          <BoardIllustration />

          {/* LEFT: PRASTROM */}
          <aside className={styles.treePanel}>
            <div className={styles.panelTitle}>🌳 Prastrom</div>
            <div className={styles.treeBody}>
              {(["AUTUMN", "SUMMER", "SPRING"] as const).map((s, i) => (
                <div
                  key={s}
                  className={`${styles.branch} ${[styles.branchNarrow, styles.branchMid, styles.branchFull][i]}`}
                >
                  <span className={`${styles.branchLabel} ${BRANCH_LABEL_CLASS[s]}`}>
                    {SEASON_LABELS[s]}
                  </span>
                  <div className={styles.workersRow}>
                    {[0, 1, 2].map(j => <div key={j} className={styles.workerSlot} />)}
                  </div>
                </div>
              ))}
              <div className={styles.trunk} />
            </div>
          </aside>

          {/* CENTER: BOARD */}
          <main className={styles.boardPanel}>

          {/* MEADOW */}
          <div className={styles.meadow}>
            <div className={styles.panelTitle}>🌸 Louka — {state.meadow.length} karet dostupných všem</div>
            <div className={styles.meadowGrid}>
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
                    actionLabel={selected ? "Zahrát z Louky" : undefined}
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

          {/* BASIC LOCATIONS */}
          <div className={styles.basicLocs}>
            <div className={styles.panelTitle}>📍 Základní lokace</div>
            <div className={styles.basicRow}>
              {BASIC_LOCATIONS.map(loc => {
                const workers = workersByLoc[loc.id] ?? []
                const canPlace = canPlaceAt(loc.id)
                return (
                  <div
                    key={loc.id}
                    className={`${styles.bloc} ${canPlace ? styles.blocActive : ""}`}
                    onClick={canPlace ? () => doAction({ type: "DEPLOY_WORKER", location: loc.id }) : undefined}
                  >
                    <div className={styles.blocName}>{loc.label}</div>
                    <RewardPips rewards={loc.rewards} />
                    <div className={styles.blocSlots}>
                      {workers.map((w, j) => (
                        <div
                          key={j}
                          className={styles.bslotOcc}
                          style={{ background: PLAYER_COLOR_HEX[w.color] ?? "#888" }}
                          title={w.username}
                        />
                      ))}
                      {canPlace && <div className={styles.bslotEmpty} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          </main>

        </div>{/* /herniDeska */}

        {/* ── RIGHT: PLAYERS ── */}
        <aside className={styles.playersPanel}>
          {state.players.map(p => {
            const isCurrentP = currentPlayer?.userId === p.userId
            const isMe = p.userId === currentUserId
            const handCount = isMe ? state.myHand.length : (p.handSize ?? 0)
            return (
              <div
                key={p.userId}
                className={`${styles.pcard} ${isCurrentP ? styles.pcardActive : ""}`}
              >
                <div className={styles.pHeader}>
                  <div className={styles.pDot} style={{ background: PLAYER_COLOR_HEX[p.color] ?? "#888" }} />
                  <span className={styles.pName}>{p.username}{isMe ? " ★" : ""}</span>
                  {isCurrentP && <span className={styles.pTurnTag}>← na tahu</span>}
                </div>
                <div className={styles.pRes}>
                  <div className={styles.pResItem}><Pip type="twigs"   /> {p.twigs}</div>
                  <div className={styles.pResItem}><Pip type="resin"   /> {p.resin}</div>
                  <div className={styles.pResItem}><Pip type="pebbles" /> {p.pebbles}</div>
                  <div className={styles.pResItem}><Pip type="berries" /> {p.berries}</div>
                </div>
                <div className={styles.pInfo}>
                  <span>🃏 {handCount}</span>
                  <span>🏘️ {p.cityCards.length}/15</span>
                  <span>👷 {p.workers.length}/2</span>
                </div>
              </div>
            )
          })}
        </aside>

        {/* ── CITY ── */}
        {me && (
          <section className={styles.cityPanel}>
            <div className={styles.panelTitle}>
              🏘️ Moje město — {me.cityCards.length}/15
            </div>
            <div className={styles.cityGrid}>
              {me.cityCards.map((cid, i) => (
                <CardTile key={`city-${i}`} cardId={cid} showEffect />
              ))}
              {me.cityCards.length === 0 && (
                <span className={styles.dimText}>Prázdné město</span>
              )}
            </div>
          </section>
        )}

        {/* ── HAND ── */}
        {me && (
          <section className={styles.handPanel}>
            <div className={styles.handTop}>
              <div>
                <div className={styles.panelTitle}>🃏 Moje ruka ({state.myHand.length} karet)</div>
                <ResBar {...me} />
              </div>
              {isMyTurn && (
                <div className={styles.actionsRow}>
                  <button
                    className={styles.btnSeason}
                    onClick={() => doAction({ type: "PREPARE_SEASON" })}
                    disabled={busy}
                  >
                    🍂 Příchod sezóny
                  </button>
                  <span className={styles.dimText}>Pomocníci: {myDeployed}/2</span>
                </div>
              )}
            </div>

            <div className={styles.handCards}>
              {state.myHand.map((cardId, i) => {
                const selected = selectedHandIdx === i
                const affordable = canAfford(cardId)
                return (
                  <div key={`hand-${i}`} className={styles.handCard}>
                    <CardTile
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
          </section>
        )}

      </div>
    </div>
  )
}
